// This module is cached as it has already been loaded
const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
let router = express.Router();
let Fridge = require('./models/fridgeModel')
let Item = require('./models/itemModel')
app.use(express.json()); // body-parser middleware

// Get /fridges and return the all of the fridges based on requested format
    router.get('/', (req,res)=> {
		console.log(req)
		res.format({/*
			'text/html': ()=> {
				res.set('Content-Type', 'text/html');
				res.sendFile(path.join(__dirname,'public','view_pickup.html'),(err) =>{
					if(err) res.status(500).send('500 Server error');
				});
			},*/
			'application/json': ()=> {
				res.set('Content-Type', 'application/json');
				Fridge.find({}).lean().exec(function(err,result){
					if(err)res.status(500).send('500 Server error');
					res.json(result)
				})
			},
			'default' : ()=> {
				res.status(406).send('Not acceptable');
			}
		})
	});

// helper route, which returns the accepted types currently available in our application. This is used by the addFridge.html page
router.get("/types", function(req, res, next){
	let types = [];
  Object.entries(req.app.locals.items).forEach(([key, value]) => {
    if(!types.includes(value["type"])){
      types.push(value["type"]);
    }
  });
	res.status(200).set("Content-Type", "application/json").json(types);
});

// Middleware function: this function validates the contents of the request body associated with adding a new fridge into the application. At the minimimum, it currently validates that all the required fields for a new fridge are provided.
function validateFridgeBody(req,res,next){
    let properties = ['items','name','can_accept_items','accepted_types','contactInfo','address','items'];

    for(property of properties){
      // hasOwnProperty method of an object checks if a specified property exists in the object. If a property does not exist, then we return a 400 bad request error
        if (!req.body.hasOwnProperty(property)){
            return res.status(400).send("Bad request");
        }
    }
    // if all the required properties were provided, then we move to the next set of middleware and continue program execution.
    next();
}
// Middleware function: this validates the contents of request body, verifies item data
function validateItemBody(req,res,next){
    let properties = ['id','quantity'];
    for (property of properties){
        if (!req.body.hasOwnProperty(property))
			return res.status(400).send("Bad request");
    }
    next();
}
// Adds a new fridge, returns newly created fridge
router.post('/', validateFridgeBody, (req,res)=> {
	// Make local changes
	Fridge.insertMany(req.body,function(err,result){
		if(err)res.status(500).send('500 Server error');
		res.json(req.body)
	})

	// Update 'database'
});
//Post /fridges/:fridgeId/items
router.post('/:fridgeId/items',validateItemBody,(req,res)=>{
	let itemId = req.body['id']
	let q = req.body['quantity']
	Fridge.findOne({'id':req.params.fridgeId},function(err,result){
		if(err)res.status(500).send('500 Server error');
		else{
			for(let i of result['items']){
				if(i['id'] == itemId){
					return res.status(409).send()
				}
			}
			result.items.push(req.body)
			result.numItemsAccepted = result.numItemsAccepted + q
			result.save(function(err){
				if(err){
					res.status(404).send("Bad request");
					return
				}
				else{
					res.json(result)
				}
			})
		}
	})
})
// Get /fridges/{fridgeID}. Returns the data associated with the requested fridge.
router.get("/:fridgeId", function(req, res, next){

	let id = req.params.fridgeId
	Fridge.find({'id':id}).exec(function(err,result){
		if(err)res.status(500).send('500 Server error');
		if(result.length == 0){
			res.status(404).send()
			return
		}
		else{
			res.json(result)
		res.status(200).send();
		return
		}
	})
});

router.put("/:fridgeID/items/:itemID",(req,res)=>{
	let id = req.params.fridgeID
	let iid = req.params.itemID
	let q = req.body.quantity
	Fridge.findOne({'id':id,'items.id':iid},function(err,result){
		if(err)res.status(500).send('500 Server error');
		else{ if(result){
			let index = result.items.findIndex(object=>{
				return object.id === iid
			})
			result.items[index].quantity = q
			result.save(function(err){
				if(err)res.status(500).send('500 Server error');
				else{
					res.send(result)
				}
			})
			return
		}
	}
	res.status(404).send()
	})
})
// Updates a fridge and returns the data associated.
// Should probably also validate the item data if any is sent, oh well :)
router.put("/:fridgeId", (req, res) =>{
	let id = req.params.fridgeId
	Fridge.findOne({'id':id},function(err,result){
		if(err)res.status(500).send('500 Server error');
		if(!result || result.length < 1 ){
			return res.status(400).send("Bad request");
		}
		console.log(result)
		let key = Object.keys(req.body)
		
		for(k of key){
			result[k] = req.body[k]
		}
		result.save(function(err){
			if(err){
				res.status(400).send("Bad request");
				return
			}
			else{
				res.status(200).send()
			}
		})
	})

})

// Deletes an item from specified fridge
router.delete("/:fridgeId/items/:itemId", (req,res)=>{
	let id = req.params.fridgeId
	let iid = req.params.itemId
	Fridge.findOne({'id':id,'items.id':iid},function(err,result){
		if(err)res.status(500).send('500 Server error');
		else{
			if(result){
				let index = result.items.findIndex(object=>{
					return object.id === iid
				})
				if(index !== -1){
					result.items.splice(index,1)
					result.save(function(err){
						if(err)res.status(500).send('500 Server error');
						else{
							res.send(result)
						}
					})
					return
				}
			}
		}
		res.status(404).send()
	})
})

router.delete("/:fridgeId/items", (req,res)=>{
	const fridges = req.app.locals.fridges;

	// Find fridge in 'database'
	let indexFound = fridges.findIndex(f => f.id == req.params.fridgeId);
	if(indexFound < 0) return res.status(404).send('Not Found');

	// Delete all items in fridge
	if (!req.query.hasOwnProperty('id')){
		fridges[indexFound].items = [];
	}
	// Remove specific items from fridge
	else{
		fridges[indexFound].items = fridges[indexFound].items.filter(item=> !req.query.id.includes(item.id));
	}
	// Update 'database'
	fs.writeFile(path.join(__dirname, 'data','comm-fridge-data.json'),JSON.stringify(req.app.locals.fridges, null, 4), (err)=>{
		if (err)
			return res.status(500).send("Database error");

		res.status(204).send();
    });
})


module.exports = router;
