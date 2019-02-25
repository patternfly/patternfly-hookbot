var express = require('express');
var router = express.Router();

var requests = [];

/* GET home page. */
router.get('/', function(req, res) {
  res.send('Hello world 3!');
});

router.post('/', function(req, res) {
  requests.push(JSON.stringify(req.body));
  res.send('Got a message:' + JSON.stringify(req.body));
});

/* GET list of hook requests. */
router.get('/hooks', function(req, res, next) {
  res.send(requests.toString());
});

module.exports = router;
