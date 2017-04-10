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
    res.render('result', {
        title: "Success",
        state: "Success",
        id: 123123
    })
})

router.get('/result/:state/:id', function(req, res, next) {

    // Get result state
    var state = req.params.state

    // Get sale ID from url
    var id = req.params.id


    if (state == 'success') {

        console.log('Loading result view')

        res.render('result', {
            title: "Success",
            state: state,
            id: id
        })
    }
})

/* GET payment page. */
router.post('/create-payment', function(req, res, next) {

    var create_payment_json = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": "http://localhost:3000/result",
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
    }


    paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
            throw error
        } else {
            console.log("Create Payment Response")
            console.log(payment)

            res.json({
                'paymentID': payment.id
            })
        }
    })
})

router.get('/execute-payment', function(req, res, next) {
    res.render('result')
})

router.post('/execute-payment', function(req, res, next) {
    var paymentID = req.body.paymentID
    var payerID = req.body.payerID


    var execute_payment_json = {
        "payer_id": payerID,
        "transactions": [{
            "amount": {
                "currency": "USD",
                "total": "1.00"
            }
        }]
    }

    paypal.payment.execute(paymentID, execute_payment_json, function (error, payment) {
        if (error) {
            console.log(error)
            throw error
        } else {
            console.log("Get Payment Response")
            console.log(JSON.stringify(payment))
            var sale = payment.transactions[0].related_resources[0].sale
            //
            console.log(sale)

            // res.redirect(304, 'http://localhost:3000/result/success/'+sale.id)
        }
    })
})

module.exports = router
