var mqtt = require('mqtt')
const MongoClient = require('mongodb').MongoClient
const assert = require('assert')

const url = 'mongodb://localhost:27017'
const dbName = 'smartmeter'
const client = new MongoClient(url)
var mqtt = mqtt.connect('mqtt://test.mosquitto.org')

client.connect(function(err) {
    assert.strictEqual(null, err)
    console.log('Connected successfully to server')

    mqtt.subscribe(["SMARTMETER-TIES-CHIEM-DATA", "SMARTMETER-TIES-CHIEM-LOGIN"], console.log)
    const db = client.db(dbName)
    const login = db.collection("login")
    const data = db.collection("data")
    mqtt.on("message", function (topic, message) {
        try{
            var doc = JSON.parse(message)
            if (topic == "SMARTMETER-TIES-CHIEM-DATA") {
                data.insertOne(doc)
            }
            if (topic == "SMARTMETER-TIES-CHIEM-LOGIN") {
                login.insertOne(doc)
            }
        } catch (error){
            console.error(error)
        }
        
        
    })
})