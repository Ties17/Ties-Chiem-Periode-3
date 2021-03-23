const express = require('express')
const app = express()
app.use(express.json())
const port = 3000
const MongoClient = require('mongodb').MongoClient
const assert = require('assert')
const url = 'mongodb://192.168.0.129:27017'
const dbName = 'smartmeter'
const client = new MongoClient(url)

app.get('/', (req, res) => {
    res.send('Hello World!')
})

//////////////////////////////////////////
//          SMARTMETER SECTION          //
//////////////////////////////////////////

app.get('/smartmeter/allData', (req, res) => {
    client.connect(function (err) {
        assert.strictEqual(null, err)
        const db = client.db(dbName)
        const data = db.collection("smartmeterdata")
        var query = {}
        data.find(query).toArray((function (err, result) {
            if (err) throw err
            res.send(result)
        }))
    })
})

app.get('/smartmeter/dataByTime', (req, res) => {
    client.connect(function (err) {
        assert.strictEqual(null, err)
        const db = client.db(dbName)
        const data = db.collection("smartmeterdata")
        var query = { Time: { $gt: req.body['Time'] } }
        data.find(query).toArray((function (err, result) {
            if (err) throw err
            res.send(result)
        }))
    })
})

app.get('/smartmeter/getLast', (req, res) => {
    client.connect(function (err) {
        assert.strictEqual(null, err)
        const db = client.db(dbName)
        const data = db.collection("smartmeterdata")
        var query = {}
        data.find(query).sort('Time', -1).limit(1).toArray((function (err, result) {
            if (err) throw err
            res.send(result)
        }))
    })
})

//////////////////////////////////////////
//          SENSORS SECTION             //
//////////////////////////////////////////

app.get('/sensors/allData', (req, res) => {
    client.connect(function (err) {
        assert.strictEqual(null, err)
        const db = client.db(dbName)
        const data = db.collection("sensordata")
        var query = {}
        data.find(query).toArray((function (err, result) {
            if (err) throw err
            res.send(result)
        }))
    })
})

app.get('/sensors/dataByTime', (req, res) => {
    client.connect(function (err) {
        assert.strictEqual(null, err)
        const db = client.db(dbName)
        const data = db.collection("sensordata")
        var query = { Time: { $gt: req.body['Time'] } }
        data.find(query).toArray((function (err, result) {
            if (err) throw err
            res.send(result)
        }))
    })
})


app.get('/sensors/getLast', (req, res) => {
    client.connect(function (err) {
        assert.strictEqual(null, err)
        const db = client.db(dbName)
        const data = db.collection("sensordata")
        var query = { MQTT_USER: req.body['MQTT_USER'] }
        data.find(query).sort('Time', -1).limit(1).toArray((function (err, result) {
            if (err) throw err
            res.send(result)
        }))
    })
})


app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})