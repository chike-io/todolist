//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-chike:test123@todolist-v2.up46dsl.mongodb.net/todolistDB");

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item ({
  name: "Welcome to your todolist"
});

const item2 = new Item ({
  name: "Hit the + button to add a new item"
});

const item3 = new Item ({
  name: "<--- hit this to delete an item"
});

const Defaultitems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {

Item.find({}, function(err, docs) {


  if (docs.length === 0) {
    Item.insertMany(Defaultitems, function(err) {
      if (err) {
        console.log(err);
      } else {
        console.log("Successfully inserted the item array");
      }
    });
    res.redirect("/");
  } else {
    res.render("list", {listTitle: "Today", newListItems: docs});
  }
});

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item ({
      name: itemName
      });
  if (listName === "Today") {
      item.save();
      res.redirect("/");
  } else {
    List.findOne({name: listName}, function(err, FoundList) {
      FoundList.items.push(item);
      FoundList.save();
      res.redirect("/" + listName);
    });
  }

});

app.post("/delete", function(req, res) {
const checkedItemId = req.body.checkbox;
const listName = req.body.listName;

if (listName === "Today") {
  Item.findByIdAndRemove(checkedItemId, function(err) {
  if (!err) {
    console.log("Successfully removed checked item");
    res.redirect("/");
  }
});
} else {
  List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err) {
    if (!err) {
      res.redirect("/" + listName);
    }
  });
}

});

app.get("/:paramName", function(req, res) {
  const customListName = _.capitalize(req.params.paramName);


  List.findOne({name: customListName}, function(err, FoundList) {
   if (!err) {
    if (FoundList) {
      res.render("list", {listTitle: FoundList.name, newListItems: FoundList.items});
    } else {
      const list = new List ({name: customListName, items: Defaultitems});
      list.save();
      res.redirect("/" + customListName);
    }
   } else {
    console.log (err);
   }
    
  });
});

app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, function() {
  console.log("Server started on port 3000");
});



