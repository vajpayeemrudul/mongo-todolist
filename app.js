
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
// const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect(<mongo atlas URI>, {useNewUrlParser: true, useUnifiedTopology:true});


//Schema
const itemsSchema ={
  name: String
};
//Mongoose model
const Item = mongoose.model("item", itemsSchema);

const item1 = new Item({
  name: "Morning Excercise"
});

const item2 = new Item({
  name: "Have three meals a day"
});

const item3 = new Item({
  name: "have six hour sleep a day"
});

const defaultItems = [item1,item2,item3];

//customlist schema
const listSchema = {
  name: String,
  items: [itemsSchema]
};
//customlist model
const List =mongoose.model("List",listSchema);


//Dynamic List  route
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

