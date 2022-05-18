// using config file to hide important data.
require('dotenv').config();

//requiring various packages which we need.
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

//Making express app.
const app = express();

//Making express app to visit views folder by setting view engine to ejs
app.set('view engine', 'ejs');

//Using bodyparser to parse user input
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//Making Mongodb connection using mongoose
const mongorul=process.env.MONGO_URL;
mongoose.connect(mongorul, {useNewUrlParser: true, useUnifiedTopology:true});

//Item Schema and mongoose model
const itemsSchema ={
  name: String
};
const Item = mongoose.model("item", itemsSchema);
const item1 = new Item({
  name: "Hi Welcome to TodoList"
});
// Making default Array to render data if no data is added by user.
const defaultItems = [item1];

//customlist schema and mongoose model
const listSchema = {
  name: String,
  items: [itemsSchema]
};
const List =mongoose.model("List",listSchema);


//Dynamic List route
const name="";
app.get("/:customListName", function(req,res){
  const customListName = _.capitalize(req.params.customListName);
  
  List.findOne({name:customListName}, function(err, foundList){
    if(!err)
    {
      if(!foundList)
        {
          //creating new lists
            const list= new List({
            name: customListName,
            items: defaultItems
          });
          list.save();
          res.redirect("/"+customListName);

        }
      else
        {
           //showing lists
          res.render("List", {listTitle: foundList.name, newListItems: foundList.items});
        }
    }
  });
  
  
});

//Home route get method.
app.get("/", function(req, res) {

Item.find({}, function(err,foundItems){
  if(foundItems.length === 0)
  {
    Item.insertMany(defaultItems, function(err){
      if(err)
      {
        console.log(err);
      }
      else{
        console.log("Successfully saved into db");
      }
    })
    res.redirect("/");
  }
  else{
    res.render("list", {listTitle: "Today", newListItems: foundItems});
  }
  
   });

});


//Post method to get user inputs 
app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if(listName === "Today")
  {
    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    })
  }
  
});


// app.post("/add", function(req,res){
//   const newListName=req.body.newList;
//   const List = new List({
//   })
// })


// Delete route method
app.post("/delete", function(req,res){
   const checkedItemId = req.body.checkbox;
   const listName = req.body.listName;

   if(listName === "Today")
   {
    Item.findByIdAndRemove(checkedItemId, function(err){
      if(!err)
      {
        console.log("Successfully deleted item.");
        res.redirect("/");
      }
    })
   }
   else{
     List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err,foundList){
       if(!err)
         res.redirect("/"+listName);
     })
   }
   
});


// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });

app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started");
});


//https://todolist4935.herokuapp.com/
// heroku on mrudulrcoem@gmail
// mongo atlas account on mrudulrcoem@gmail