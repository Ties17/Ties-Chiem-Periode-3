SmartmeterData = require('./dataModel')

exports.index = function (req, res) {
    SmartmeterData.get(function (err, datas) {
        if(err){
            res.json({
                status: "error",
                message: err
            })
        }
        res.json({
            status: "succes",
            message: "Data retrieved successfully",
            data: Data
        })
    })
}

exports.view = function(req, res) {
    SmartmeterData.findById(req.params.data_id, function(err, smartmeterdata){
        if(err)
            res.send(err)
        res.json({
            message: 'Data loading..',
            data: smartmeterdata
        })
    })
}

exports.getAllData = (req, res) => {
    SmartmeterData.getAllData()  {
        res.status(200).send()
    }
}