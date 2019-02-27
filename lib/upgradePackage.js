const os = require('os');
const exec = require('child_process').execSync
const path = require('path');
const https = require('https');
const fs = require('fs-extra');
const Octokit = require('@octokit/rest')
const octokit = new Octokit({
    auth: 'token ' + process.env.GH_TOKEN
});

function findFilesInDir(startPath, filter){
    var results = [];

    if (!fs.existsSync(startPath)){
        console.log('no dir', startPath);
        return;
    }

    var files = fs.readdirSync(startPath);
    for(var i = 0; i < files.length; i++){
        var filename = path.join(startPath, files[i]);
        if (fs.lstatSync(filename).isDirectory()){
            results = results.concat(findFilesInDir(filename,filter)); //recurse
        }
        else if (files[i] === filter) {
            results.push(filename);
        }
    }
    return results;
}

function writePackageJsonUpdates(dir, packageName, newVersion) {
    return new Promise(resolve => {
        const files = findFilesInDir(dir, 'package.json');
        const regex = new RegExp(
            // @patternfly/patternfly: "12345"
            '("' + packageName.replace('/', '\\/') + '"\\s*:\\s*")' + '.*"');
        files.forEach(file => {
            const contents = fs.readFileSync(file, 'utf8');
            const updated = contents.replace(regex, `$1${newVersion}"`);
            if (contents !== updated) {
                console.log('bumping', file.replace(dir, ''));
                fs.writeFileSync(file, updated);
            }
        });
        resolve();
    });
}

function updateLockfile(dir, packageName, newVersion, distInfo) {
    const file = dir + '/yarn.lock';
    const contents = fs.readFileSync(file, 'utf8');
    const regex = new RegExp(
        // "@patternfly/patternfly@1.0.178":
        //     version "1.0.178"
        //     resolved "https://registry.yarnpkg.com/@patternfly/patternfly/-/patternfly-1.0.178.tgz#5b520cc6da54f54a7b5a0c449101335cfbff5218"
        '("' + packageName.replace('/', '\\/') + '@).*(":\n' +
        '\\s+version ").*("\n' +
        '\\s+resolved ").*"');
    
    const tarball = distInfo.tarball.replace('registry.npmjs.org', 'registry.yarnpkg.com');
    const updated = contents.replace(regex,
        `$1${newVersion}$2${newVersion}$3${tarball}#${distInfo.shasum}"`);
    if (contents !== updated) {
        console.info('bumping', file.replace(dir, ''));
        fs.writeFileSync(file, updated);
    }
}

function writeLockfileUpdates(dir, packageName, newVersion) {
    return new Promise(resolve => {
            https.get(`https://registry.yarnpkg.com/${packageName}`, (resp) => {
            let data = '';
            resp.on('data', (chunk) => {
                data += chunk;
            });
            resp.on('end', () => {
                const distInfo = JSON.parse(data)['versions'][newVersion]['dist'];
                updateLockfile(dir, packageName, newVersion, distInfo);
                resolve();
            });

        }).on("error", (err) => {
            console.error("Error: " + err.message);
        })
    });
}

function cloneRepo(cloneURL, dir) {
    return new Promise(resolve => {
        fs.remove(dir)
            .then(() => {
                const url = `${cloneURL.replace('https://', `https://${process.env.GH_TOKEN}@`)}.git`;
                console.info('Cloning', url, 'into', dir);
                exec(`git clone -q --depth 10 ${url} ${dir}`);
                resolve();
            })
    });
}

function upgradePackage(cloneURL, packageName, newVersion) {
    return new Promise(resolve => {
        const dir = os.tmpdir() + '/temprepo';
        const urlSplit = cloneURL.replace('//', '').split('/');
        const owner = urlSplit[1];
        const repo = urlSplit[2];
        const commitMessage = `Bump ${packageName} versions to ${newVersion}`;
        const packageSplit = packageName.split('/');
        const remoteBranch = `chore/bump-${packageSplit[packageSplit.length - 1]}-${newVersion}`;

        cloneRepo(cloneURL, dir)
            .then(() => writePackageJsonUpdates(dir, packageName, newVersion))
            .then(() => writeLockfileUpdates(dir, packageName, newVersion))
            .then(() => {
                console.info('Creating commit');
                exec(`git add .`, {cwd: dir});
                exec(`git commit -m "chore(package): ${commitMessage}"`, {cwd: dir});
                console.info('Pushing to', remoteBranch);
                exec(`git push -q origin master:${remoteBranch}`, {cwd: dir});

                console.info('Creating Github PR');
                octokit.pulls.create({
                    owner: owner,
                    repo: repo,
                    title: commitMessage,
                    head: remoteBranch,
                    base: 'master',
                    body: `**What**: ${commitMessage}\n\n**Additional issues**: I'm a bot.`,
                    maintainer_can_modify: true});
            })
            .then(() => console.info('Done.'))
            .then(() => resolve())
            .catch((err) => console.error("Error: ", err));
        });
}

upgradePackage('https://github.com/redallen/patternfly-react', '@patternfly/patternfly', '1.0.202');

module.exports = upgradePackage;