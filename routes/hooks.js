var express = require('express');
var router = express.Router();
var upgradePackage = require('../lib/upgradePackage');

var requests = [];

/* GET list of handled hook requests. */
router.get('/', function(req, res, next) {
    res.send(requests.toString());
});

function verifySecret(res) {
    console.log('verifying secret', process.env.NPM_SECRET);
    if ('' === process.env.NPM_SECRET)
        return true;
    
    return false;
}

router.post('/npm', function(req, res) {
    requests.push(JSON.stringify(req.body));
    console.log(req.headers);

    verifySecret(res);

    if (req.body['event'] === 'package:publish') {
        if (req.body['name'] === '@patternfly/patternfly') {
            upgradePackage('https://github.com/redallen/patternfly-react', req.body['name'], req.body['change']['version'])
        }
        else if (req.body['name'] === 'registrytestpackage') {
            upgradePackage('https://github.com/redallen/patternfly-react', req.body['name'], req.body['change']['version'])
        }
    }
    res.sendStatus(200);
});

module.exports = router;
