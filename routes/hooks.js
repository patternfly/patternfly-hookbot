var express = require('express');
var router = express.Router();
var upgradePackage = require('../lib/upgradePackage');

var requests = [];

/* GET list of handled hook requests. */
router.get('/', function(req, res, next) {
    res.send(requests.toString());
});

router.post('/npm', function(req, res) {
    requests.push(JSON.stringify(req.body));
    console.log(req.body);
    // upgradePackage('https://github.com/redallen/patternfly-react', '@patternfly/patternfly', '1.0.200')
});

module.exports = router;
