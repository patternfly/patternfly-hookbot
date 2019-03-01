const express = require('express');
const router = express.Router();
const upgradePackage = require('../lib/upgradePackage');

let requests = [];

// TODO: how to verify header 'x-npm-signature': 'sha256=' ?
function verifySecret(sig) {
    if ('' === process.env.NPM_SECRET)
        return true;
    
    return false;
}

/* GET list of handled hook requests. */
router.get('/npm', function(req, res, next) {
    res.send(requests.toString());
});

/* POST handle NPM webhook */
router.post('/npm', function(req, res) {
    requests.push(JSON.stringify(req.body));
    verifySecret(req.headers['x-npm-signature']);
    console.info('Got hook:', req);

    if (req.body['event'] === 'package:publish') {
        if (req.body['name'] === '@patternfly/patternfly') {
            upgradePackage('https://github.com/patternfly/patternfly-react', req.body['name'], req.body['change']['version'])
            .catch((err) => console.error('Error upgrading : ', err));
        }
        else if (req.body['name'] === 'registrytestpackage') {
            // Hack to test hooks
            upgradePackage('https://github.com/patternfly/patternfly-react', '@patternfly/patternfly', '1.0.215')
            .catch((err) => console.error('Error upgrading : ', err));
        }
    }
    res.sendStatus(200);
});

module.exports = router;
