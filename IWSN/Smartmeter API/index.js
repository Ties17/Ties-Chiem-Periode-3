let express = require('express')
let apiRoutes = require("./api-routes")
let bodyParser = require('body-parser')
let mongoose = require('mongoose')

let app = express()

var port = process.env.PORT || 8080

app.get('/', (req, res) => res.send('Hello world with Express and Nodemon'))

app.listen(port, function() {
    console.log('Running Smartmeter api on port ' + port)
})

app.use('/api', apiRoutes)

app.use(bodyParser.urlencoded({
    extended: true
}))

app.use(bodyParser.json())

mongoose.connect('mongodb://192.168.0.129/27017', {
    useNewUrlParser: true
})

var db = mongoose.connection