
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const date = require(__dirname + '/date');
const _ = require('lodash');

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Connect to MongoDB using environment variable
mongoose.connect("mongodb+srv://todo:todo@cluster0.hwnpw.mongodb.net/", { 
    useNewUrlParser: true, 
    useUnifiedTopology: true,
    dbName: 'todolistDB' // Specify your database name
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.log(err));

// Schema Definitions
const todolistSchema = {
    work: String,
};

const listSchema = {
    work: String,
    items: [todolistSchema]
};

// Model Definitions
const ListItem = mongoose.model("ListItem", todolistSchema);
const ArrayList = mongoose.model("ArrayList", listSchema);

// Default Items
const item1 = new ListItem({ work: "Running" });
const item2 = new ListItem({ work: "HomeWork" });
const item3 = new ListItem({ work: "Walking" });
const defaultList = [item1, item2, item3];

// Root Route
app.get('/', async (req, res) => {
    try {
        const day = date();
        const listitems = await ListItem.find();
        res.render("list", { listTitle: day, newdata: listitems });
    } catch (err) {
        console.log(err);
        res.status(500).send("Internal Server Error");
    }
});

// Dynamic Route
app.get('/:field', async (req, res) => {
    try {
        const fieldName = _.capitalize(req.params.field);
        let listitems = await ArrayList.findOne({ work: fieldName });

        if (!listitems) {
            console.log("List does not exist. Creating a new one.");
            const list = new ArrayList({
                work: fieldName,
                items: defaultList
            });
            await list.save();
            res.redirect('/' + fieldName);
        } else {
            res.render('list', { listTitle: fieldName, newdata: listitems.items });
        }
    } catch (err) {
        console.log(err);
        res.status(500).send("Internal Server Error");
    }
});

// Add New Item
app.post("/", async (req, res) => {
    const newlist = req.body.newlist; // Work added by user
    const listName = req.body.list;
    const day = date();
    const newItem = new ListItem({ work: newlist });

    try {
        if (listName === day) {
            await newItem.save();
            res.redirect('/');
        } else {
            const listitems = await ArrayList.findOne({ work: listName });
            listitems.items.push(newItem);
            await listitems.save();
            res.redirect('/' + listName);
        }
    } catch (err) {
        console.log(err);
        res.status(500).send("Internal Server Error");
    }
});

// Delete Item
app.post("/delete", async (req, res) => {
    const checkedItemId = req.body.checkbox;
    const listname = req.body.listName;
    const day = date();

    try {
        if (listname === day) {
            await ListItem.deleteOne({ _id: checkedItemId });
            res.redirect("/");
        } else {
            await ArrayList.findOneAndUpdate(
                { work: listname },
                { $pull: { items: { _id: checkedItemId } } }
            );
            res.redirect('/' + listname);
        }
    } catch (err) {
        console.log(err);
        res.status(500).send("Internal Server Error");
    }
});

// Start Server
const port = process.env.PORT || 8000;
app.listen(port, function () {
    console.log('Server is running on port ' + port);
});
