var express = require('express');
var router = express.Router();
var upgradePackage = require('../lib/upgradePackage');

var requests = [];

/* GET list of handled hook requests. */
router.get('/', function(req, res, next) {
    res.send(requests.toString());
});

// TODO: how to verify header 'x-npm-signature': 'sha256=' ?
function verifySecret(sig) {
    if ('' === process.env.NPM_SECRET)
        return true;
    
    return false;
}

router.post('/npm', function(req, res) {
    requests.push(JSON.stringify(req.body));
    verifySecret(req.headers['x-npm-signature']);

    if (req.body['event'] === 'package:publish') {
        if (req.body['name'] === '@patternfly/patternfly') {
            upgradePackage('https://github.com/patternfly/patternfly-react', req.body['name'], req.body['change']['version']);
        }
        else if (req.body['name'] === 'registrytestpackage') {
            upgradePackage('https://github.com/redallen/patternfly-react', req.body['name'], req.body['change']['version']);
        }
    }
    res.sendStatus(200);
});

module.exports = router;
