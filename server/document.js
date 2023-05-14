//lets our db know what kind of shit we want to save in 

const{Schema, model} = require('mongoose')

const Document = new Schema({
    _id: String,
    data: Object
})

module.exports = model("Document", Document)