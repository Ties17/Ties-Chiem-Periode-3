var mongoose = require('mongoose')

var smartmeterDataSchema = mongoose.Schema({
    MQTT_USER: String,
    Data: String,
    Time: Number
})

var Data = module.exports = mongoose.model('smartmeterData', smartmeterDataSchema)

module.exports.get = function(callback, limit) {
    Data.find(callback).limit(limit)
}

module.exports.getAllData = () => {
    return Data.find()
}