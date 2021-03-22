let router = require('express').Router()

router.get('/', function (req, res) {
    res.json({
        status: 'API its working',
        message: 'Welcome to RESTHub!'
    })
})

var dataController = require('./dataController')

router.route('/data')
    .get(dataController.index)

router.route('/getAllData')
    .get(dataController.getAllData)

module.exports = router;