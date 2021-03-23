var mqtt = require('mqtt')
const MongoClient = require('mongodb').MongoClient
const assert = require('assert')

const url = 'mongodb://localhost:27017'
const dbName = 'smartmeter'
const client = new MongoClient(url)
var mqtt = mqtt.connect('mqtt://test.mosquitto.org')

client.connect(function (err) {
    assert.strictEqual(null, err)
    console.log('Connected successfully to server')

    mqtt.subscribe(["SMARTMETER-TIES-CHIEM-DATA", "SMARTMETER-TIES-CHIEM-LOGIN"], console.log)
    const db = client.db(dbName)
    const login = db.collection("login")
    const smartmeterdata = db.collection("smartmeterdata")
    const sensordata = db.collection("sensordata")
    mqtt.on("message", function (topic, message) {
        try {
            var doc = JSON.parse(message)
            if (topic == "SMARTMETER-TIES-CHIEM-LOGIN") {
                login.insertOne(doc)
            }else {
                if (doc['MQTT_USER'].match('SMARTMETER') != null) {
                    doc = parseDataToJson(doc);
                }
                if (topic == "SMARTMETER-TIES-CHIEM-DATA") {
                    if (doc['MQTT_USER'].match('SMARTMETER')) {
                        smartmeterdata.insertOne(doc)
                    }
                    if (doc['MQTT_USER'].match('SENSORDATA')) {
                        sensordata.insertOne(doc)
                    }
                }
            }            
        } catch (error) {
            console.error(error)
        }
    })
})

function parseDataToJson(doc) {
    var json = {}
    var data = doc['Data'].split("\r\n")
    for(var key in doc){
        if(key != 'Data'){
            json[key] = doc[key]
        }
    }
    var fdata = []
    data.forEach(element => {
        if (element.match(':') != null) {
            fdata.push(element)
        }
    });

    fdata.forEach(element => {
        var key = element.split('(')[0]
        var d = element.slice(key.length)
        if(d.indexOf('(') == d.lastIndexOf('(')){
            d = d.substring(d.indexOf('(') + 1, d.indexOf(')'))
        } else {
            d = d.split(')(')
            d[0] = d[0].slice(1)
            d[d.length - 1] = d[d.length - 1].substring(0, d.length - 1)
        }
        key = obisRefSwitchTable(key)
        if(key != null){
            json[key] = d
        }
    })

    return json
}

function obisRefSwitchTable(code) {
    switch (code) {
        case '1-3:0.2.8':
            return "P1 output version information"
        case '0-0:1.0.0':
            return "P1 message timestamp"
        case '0-0:96.1.1':
            return "Equipment id"
        case '1-0:1.8.1':
            return "electricity delivered to client (tariff 1) in 0,001kWh"
        case '1-0:1.8.2':
            return "electricity delivered to client (tariff 2) in 0,001kWh"
        case '1-0:2.8.1':
            return "electricity delivered by client (tariff 1) in 0,001kWh"
        case '1-0:2.8.2':
            return "electricity delivered by client (tariff 2) in 0,001kWh"
        case '0-0:96.14.0':
            return "Tariff indicator elextricity"
        case '1-0:1.7.0':
            return "Actual electricity power delivered (+P) in 1 watt resolution"
        case '1-0:2.7.0':
            return "Actual electricity power received (-P) in 1 Watt resolution"
        case '0-0:96.7.21':
            return "Number of power failures in any phase"
        case '0-0:96.7.9':
            return "Number of long power failures in any phase"
        case '1-0:99.97.0':
            return "Power Failure Event Log (long power failures)"
        case '1-0:32.32.0':
            return "Number of voltage sags in phase L1"
        case '1-0:52.32.0':
            return "Number of voltage sags in phase L2"
        case '1-0:72.32.0':
            return "Number of voltage sags in phase L3"
        case '1-0:32.36.0':
            return "Number of voltage swells in phase L1"
        case '1-0:52.36.0':
            return "Number of voltage swells in phase L2"
        case '1-0:72.36.0':
            return "Number of voltage swells in phase L3"
        case '0-0:96.13.0':
            return "Text message max 1024 characters"
        case '1-0:31.7.0':
            return "Instantaneous current L1 in A resolution"
        case '1-0:51.7.0':
            return "Instantaneous current L2 in A resolution"
        case '1-0:71.7.0':
            return "Instantaneous current L3 in A resolution"
        case '1-0:21.7.0':
            return "Instantaneous active power L1 (+P) in W resolution"
        case '1-0:41.7.0':
            return "Instantaneous active power L2 (+P) in W resolution"
        case '1-0:61.7.0':
            return "Instantaneous active power L3 (+P) in W resolution"
        case '1-0:22.7.0':
            return "Instantaneous active power L1 (-P) in W resolution"
        case '1-0:42.7.0':
            return "Instantaneous active power L2 (-P) in W resolution"
        case '1-0:62.7.0':
            return "Instantaneous active power L3 (-P) in W resolution"
        case '0-1:24.1.0':
            return "Device-Type"
        case '0-1:96.1.0':
            return "Equipment id (Water)"
        case '0-1:24.2.1':
            return "Last 5-minute Meter reading in 0,001 m3 and capture time"
        default:
            return null
    }
}