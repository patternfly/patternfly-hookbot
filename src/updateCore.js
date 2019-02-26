const os = require('os');
const exec = require('child_process').execSync
const path = require('path');
const https = require('https');
const fs = require('fs-extra');
const octokit = new require('@octokit/rest')();

// const author = git.Signature.now('patternfly-build', 'patternfly-build@redhat.com');
// function commitAll(repo, message) {
//     var index;
//     var oid;

//     repo.refreshIndex()
//         .then(ind => {
//             index = ind;
//             return index.addAll();
//         })
//         .then(() => index.write())
//         .then(() => index.writeTree())
//         .then(id => {
//             oid = id;
//             return git.Reference.nameToId(repo, 'HEAD');
//         })
//         .then(head => repo.getCommit(head))
//         .then(parent => {
//             return repo.createCommit('HEAD', author, author, message, oid, [parent]);
//         })
//         .catch(err => console.error(err));
// }

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
        console.log('bumping lockfile', file.replace(dir, ''));
        fs.writeFileSync(file, updated);
    }
}

function writeLockfileUpdates(dir, packageName, newVersion) {
    // const contents = fs.readFileSync(dir + '/yarn.lock', 'utf8');
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

function upgradePackage(cloneURL, packageName, newVersion) {
    const dir = os.tmpdir() + '/temprepo';
    fs.removeSync(dir);
    console.log('Cloning', cloneURL, 'into', dir);
    exec(`git clone ${cloneURL} ${dir}`);
    writePackageJsonUpdates(dir, packageName, newVersion);
    writeLockfileUpdates(dir, packageName, newVersion)
        .then(() => {
            exec(`git add .`, {cwd: dir});
            exec(`git commit -m "chore(package): Bump ${packageName} versions to ${newVersion}"`, {cwd: dir});
        });
}

upgradePackage('https://github.com/redallen/patternfly-react', '@patternfly/patternfly', '1.0.200')