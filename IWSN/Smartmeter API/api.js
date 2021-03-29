const express = require('express')
const cors = require('cors')
const app = express()
app.use(express.json())
app.use(cors())
const port = 3000
const MongoClient = require('mongodb').MongoClient
const assert = require('assert')
const url = 'mongodb://localhost:27017'
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

app.get('/smartmeter/dataByTime/', (req, res) => {
    client.connect(function (err) {
        assert.strictEqual(null, err)
        const db = client.db(dbName)
        const data = db.collection("smartmeterdata")
        var query = { Time: { $gt: Number(req.query.time) } }
        var sort = { Time: 1 }
        data.find(query).sort(sort).toArray((function (err, result) {
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
//          POWERDATA  SECTION          //
//////////////////////////////////////////

app.get('/powerdata/allData', (req, res) => {
    client.connect(function (err) {
        assert.strictEqual(null, err)
        const db = client.db(dbName)
        const data = db.collection("powerdata")
        var query = {}
        data.find(query).toArray((function (err, result) {
            if (err) throw err
            res.send(result)
        }))
    })
})

app.get('/powerdata/dataByTime', (req, res) => {
    client.connect(function (err) {
        assert.strictEqual(null, err)
        const db = client.db(dbName)
        const data = db.collection("powerdata")
        var query = { Time: { $gt: Number(req.query.time) } }
        var sort = { Time: 1 }
        data.find(query).sort(sort).toArray((function (err, result) {
            if (err) throw err
            res.send(result)
        }))
    })
})

app.get('/powerdata/getLast', (req, res) => {
    client.connect(function (err) {
        assert.strictEqual(null, err)
        const db = client.db(dbName)
        const data = db.collection("powerdata")
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
        var query = { Time: { $gt: Number(req.query.time) } }
        var sort = { Time: 1 }
        data.find(query).sort(sort).toArray((function (err, result) {
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