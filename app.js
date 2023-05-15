const express = require('express');
const request = require('request');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const date = require(__dirname + '/date');
const _ = require('lodash');
mongoose.connect("mongodb+srv://admin-rahul:Test123@cluster.haqzbjh.mongodb.net/todolistDB", { useNewUrlParser: true });

//Schema of Mongoose Database

const todolistSchema = { //you can write  "new mongoose.Schema" also after = 
    work: String,
};

const listSchema = {
    work: String,
    items: [todolistSchema]
}

//Create Collection 
const ListItem = mongoose.model("ListItem", todolistSchema);
const ArrayList = mongoose.model("ArrayList", listSchema);

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
File



app.get('/', function (req, res) {
    ListItem.find().then(function (listitems) {
        // console.log(listitems); // to Print the whole DataBase
        res.render("list", { listTitle: day, newdata: listitems });

    }).catch(function (err) {
        console.log(err);
    });
    let day = date();
});


const item1 = new ListItem({
    work: "Running"
});
const item2 = new ListItem({
    work: "HomeWork"
});
const item3 = new ListItem({
    work: "Walking"
});

const defualtList = [item1, item2, item3];

app.get('/:field', function (req, res) {
    const fieldName =_.capitalize(req.params.field);  //_.lowerCase(req.params.field);

    ArrayList.findOne({ work: fieldName }).then(function (listitems) { //to check in list item is exist or notif not then add 
        if (!listitems) {
            console.log("Doesn't exist");

            const list = new ArrayList({
                work: fieldName,
                items: defualtList
            })
            list.save();
            res.redirect('/' + fieldName);
        } else {
            res.render('list', { listTitle: fieldName, newdata: listitems.items });
        }
    }).catch(function (err) {
        console.log(err);
    });
});


app.post("/", function (req, res) {
    let newlist = req.body.newlist; //work that add by user
    let listName = req.body.list;
    let day = date();
    const newItem = new ListItem({
        work: newlist,
    });
    if (listName == day) {
        newItem.save();
        res.redirect('/');
    } else {
        
        ArrayList.findOne({ work: listName }).then(function (listitems) { //to check in list item is exist or notif not then add 

           listitems.items.push(newItem);
           listitems.save(); 
            res.redirect('/'+ listName );

        }).catch(function (err) {
            console.log(err);
        });
    }
});



app.post("/delete", function (req, res) {
    const checkedItemId =req.body.checkbox;
    const listname = req.body.listName;
    console.log(req.body);
    let day = date();
    if (listname == day) {
        ListItem.deleteOne({ _id: checkedItemId}).then(function (listitems) {
            console.log(" Deleted successfully");
            res.redirect("/");
        }).catch(function (err) {
            console.log(err);
        });
    }else{
        ArrayList.findOneAndUpdate({ work: listname},{$pull:{items:{_id : checkedItemId}}}).then(function (listItems){
            res.redirect('/'+listname);
        }).catch(function (err) {
            console.log(err);
        });
    }

    
});

app.use(express.static("public"));

let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}


app.listen(port, function () {
    console.log('listening on port ');
});




//Create data for list item

/*
const item1 = new ListItem({
    work : "Running"
});
const item2 = new ListItem({
    work : "HomeWork"
});
const item3 = new ListItem({
    work : "Walking"
});
*/

// ListItem.insertMany([item1, item2, item3]).then(function(listItems) {
//     console.log("ListItem add Successfully");
// }).catch(function(err) {
//     console.log(err);
// });


// ListItem.find().then(function (listitems){
//     // console.log(fruits); // to Print the whole DataBase
//     mongoose.connection.close();
//     listitems.forEach(function(listitems){
//        items = listitems.work; //Print the All Fruits Name
//     })
// }).catch(function (err) {
//     console.log(err);
// });