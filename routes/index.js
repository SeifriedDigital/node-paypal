var express = require('express')
var router = express.Router()
var paypal = require('paypal-rest-sdk')
var http = require('http')

paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': 'AVe3Wjq55GPvwXhIt0JkbVZKqR4b7TzmEOoqBBq0FnDHkcuXlFiXhWfD9IyV_Dcrm3msgq-nNE64rXQa',
    'client_secret': 'EIumHkaNXsOmY12YGfEoyzdvp1km_6YCjV1AcewSdPk_ZkIeVGqs3Hkou3M4yrQ7HBUCJSUynbpJicfA'
})

/* GET home page. */
router.get('/', function(req, res, next) {

  res.render('index',
      {
        title: 'Express'
      })
})

router.get('/result', function(req, res, next) {
    res.redirect('/')
})

router.get('/result/error/:error', function (req, res, next) {
    let error = req.params.error

    console.log("Transaction error: " + error)

    res.render('result', {
        title: 'Transaction Error',
        error: error
    })
})

router.get('/result/:state/:id', function(req, res, next) {
    let state = req.params.state
    let id = req.params.id

    console.log("Sale state: " + state)
    console.log("Sale ID :" + id)

    res.render('result', {
        title: 'Transaction Results',
        state: state,
        id: id
    })
})

router.post('/create-payment/:amount', function(req, res, next) {
    var amount = req.params.amount
    console.log(amount)

    if (amount <= 0) {
        res.redirect('./')
    }

    var create_payment_json = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": "http://localhost:3000/result",
            "cancel_url": "http://localhost:3000/"
        },
        "transactions": [{
            "item_list": {
                "items": [{
                    "name": "Donation",
                    "sku": "Donation",
                    "price": amount,
                    "currency": "USD",
                    "quantity": 1
                }]
            },
            "amount": {
                "currency": "USD",
                "total": amount
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
                paymentID: payment.id
            });
        }
    })
})

router.post('/execute-payment', function(req, res, next) {
    var paymentID = req.body.paymentID
    var payerID = req.body.payerID

    var execute_payment_json = {
        "payer_id": payerID,
    }

    paypal.payment.execute(paymentID, execute_payment_json, function (error, payment) {
        if (error) {
            console.log(error)
            throw error
        } else {
            console.log("Get Payment Response")
            console.log(JSON.stringify(payment))

            // Get sale object from response
            var sale = payment.transactions[0].related_resources[0].sale

            // Pass data to body for client side redirect
            res.json({
                paymentID: paymentID,
                payerID: payerID,
                state: sale.state,
                saleID: sale.id
            })
        }
    })
})


module.exports = router
