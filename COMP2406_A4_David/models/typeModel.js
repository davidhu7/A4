const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// TODO: create the schema for a Type
const type = Schema({
    id:{
        require:true,
        type:String,
        minlength:1,
        maxlength:4
    },
    name:{
        type:String,
        minlength:1,
        maxlength:100
    }
})
module.exports = mongoose.model('types',type)