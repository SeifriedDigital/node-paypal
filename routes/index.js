var express = require('express');
var router = express.Router();


// PayPal API Integration
var payPalAccessToken = 'access_token$sandbox$b92mts6ng7s7xh3h$12ac80d3c73f14f567f8bb57b66bcfea';


// End PayPal API Integration

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
