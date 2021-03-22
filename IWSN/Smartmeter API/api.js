const express = require('express')
const app = express()
const port = 3000
const MongoClient = require('mongodb').MongoClient
const assert = require('assert')
const url = 'mongodb://192.168.0.129:27017'
const dbName = 'smartmeter'
const client = new MongoClient(url)


app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.get('/allData', (req, res) => {
    client.connect(function (err) {
        assert.strictEqual(null, err)
        const db = client.db(dbName)
        const data = db.collection("data")
        var query = { Time: { $gt: 1616411511}}
        data.find(query).toArray((function(err, result) {
            if(err) throw err
            res.send(result)
        }))
    })
})

app.get('/dataByTime', (req, res) => {
    
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})