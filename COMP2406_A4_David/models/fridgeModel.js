const mongoose = require("mongoose");
const Schema = mongoose.Schema;
let Type = require("./typeModel");
let Item = require("./itemModel");
const typeModel = require("./typeModel");
// TODO: create the schema for a Fridge
const fridge = Schema({
    id:{
        type: String,
        require: true,
        minlength:4,
        maxlength:6
    },
    name:{
        type:String,
        require:true,
        minlength:1,
        maxlength:20
    },
    numItemsAccepted:{
        type:Number,
        default:0
    },
    canAcceptItems:{
        type:Number,
        require:true,
        min:[1,"Can accept at least 1"],
        max:[100,"Can only accept 100"]
    },
    contactInfo:{
        type:{
            contactPerson:{type:String},
            contactPhone:{type:String}
        }
    },
    address:{
        type:{
            street:{type:String},
            postalCode:{type:String},
            city:{type:String},
            province:{type:String},
            country:{type:String}
        },
        require:true
    },
    acceptedTypes:{
        require:true,
        type:[{type:String}]
    },
    items:[{
        id:String,
        quantity:Number
    }]
    /*
    items:{
        type:[{
            id:{type:String},
            quantity:{Type:Number}
        }]
        
    }
    */
})
module.exports = mongoose.model("fridge",fridge)