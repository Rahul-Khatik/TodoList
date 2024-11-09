const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date");
const _ = require("lodash");

// Connect to MongoDB
mongoose.connect("mongodb+srv://todo:todo@cluster0.hwnpw.mongodb.net/", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Schema for Mongoose Database
const todolistSchema = {
  work: String,
};

const listSchema = {
  work: String,
  items: [todolistSchema],
};

// Create Collection
const ListItem = mongoose.model("ListItem", todolistSchema);
const ArrayList = mongoose.model("ArrayList", listSchema);

const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

// Default list items
const item1 = new ListItem({ work: "Running" });
const item2 = new ListItem({ work: "HomeWork" });
const item3 = new ListItem({ work: "Walking" });
const defaultList = [item1, item2, item3];

// Home route
app.get("/", async function (req, res) {
  try {
    let listitems = await ListItem.find();
    let day = date();
    res.render("list", { listTitle: day, newdata: listitems });
  } catch (err) {
    console.log(err);
  }
});

// Dynamic route based on URL (field name)
app.get("/:field", async function (req, res) {
  const fieldName = _.capitalize(req.params.field);
  try {
    let listitems = await ArrayList.findOne({ work: fieldName });
    if (!listitems) {
      console.log("Doesn't exist");
      const list = new ArrayList({
        work: fieldName,
        items: defaultList,
      });
      await list.save();
      res.redirect("/" + fieldName);
    } else {
      res.render("list", { listTitle: fieldName, newdata: listitems.items });
    }
  } catch (err) {
    console.log(err);
  }
});

// Add new item to the list
app.post("/", async function (req, res) {
  let newlist = req.body.newlist;
  let listName = req.body.list;
  let day = date();
  const newItem = new ListItem({
    work: newlist,
  });

  try {
    if (listName == day) {
      await newItem.save();
      res.redirect("/");
    } else {
      let listitems = await ArrayList.findOne({ work: listName });
      listitems.items.push(newItem);
      await listitems.save();
      res.redirect("/" + listName);
    }
  } catch (err) {
    console.log(err);
  }
});

// Delete an item from the list
app.post("/delete", async function (req, res) {
  const checkedItemId = req.body.checkbox;
  const listname = req.body.listName;
  let day = date();

  try {
    if (listname == day) {
      await ListItem.deleteOne({ _id: checkedItemId });
      res.redirect("/");
    } else {
      await ArrayList.findOneAndUpdate(
        { work: listname },
        { $pull: { items: { _id: checkedItemId } } }
      );
      res.redirect("/" + listname);
    }
  } catch (err) {
    console.log(err);
  }
});

// Static files
app.use(express.static("public"));

// Set port
let port = process.env.PORT || 8000;
app.listen(port, function () {
  console.log("Server running on port " + port);
});
