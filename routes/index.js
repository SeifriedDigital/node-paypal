var express = require('express');
var router = express.Router();
var paypal = require('paypal-rest-sdk');
var http = require('http');

paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': 'AVe3Wjq55GPvwXhIt0JkbVZKqR4b7TzmEOoqBBq0FnDHkcuXlFiXhWfD9IyV_Dcrm3msgq-nNE64rXQa',
    'client_secret': 'EIumHkaNXsOmY12YGfEoyzdvp1km_6YCjV1AcewSdPk_ZkIeVGqs3Hkou3M4yrQ7HBUCJSUynbpJicfA'
});

/* GET home page. */
router.get('/', function(req, res, next) {

  res.render('index',
      {
        title: 'Express'
      });
});

/* GET payment page. */
router.post('/create-payment', function(req, res, next) {

    var create_payment_json = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": "http://localhost:3000/execute-payment",
            "cancel_url": "http://localhost:3000/cancel"
        },
        "transactions": [{
            "item_list": {
                "items": [{
                    "name": "item",
                    "sku": "item",
                    "price": "1.00",
                    "currency": "USD",
                    "quantity": 1
                }]
            },
            "amount": {
                "currency": "USD",
                "total": "1.00"
            },
            "description": "This is the payment description."
        }]
    };


    paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
            throw error;
        } else {
            console.log("Create Payment Response");
            console.log(payment);

            res.json({
                'paymentID': payment.id
            })
        }
    });
})

router.post('/execute-payment', function(req, res, next) {
    var paymentID = req.body.paymentID;
    var payerID = req.body.payerID;

    var execute_payment_json = {
        "payer_id": payerID,
        "transactions": [{
            "amount": {
                "currency": "USD",
                "total": "1.00"
            }
        }]
    };


    paypal.payment.execute(paymentID, execute_payment_json, function (error, payment) {
        if (error) {
            console.log(error);
            throw error;
        } else {
            console.log("Get Payment Response");
            console.log(payment);

            res.render('result',
                {
                    title: 'Success',
                    msg: 'Transaction was confirmed!'
                });
        }
    });
});

module.exports = router;
