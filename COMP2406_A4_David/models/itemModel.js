const mongoose = require("mongoose");
const Schema = mongoose.Schema;
let Type = require("./typeModel");
// TODO: create the schema for an Item
const item = Schema({
    id:{
        type:String,
        require:true,
        minlength:1,
        maxlength:4
    },
    name:{
        require:true,
        type:String,
        minlength:3,
        maxlength:20
    },
    type:{
        require:true,
        type:String
    },
    img:{ 
        require:true,
        type:String,
        minlength:5,
        maxlength:50
    }
})
module.exports = mongoose.model('item',item)