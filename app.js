const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const _ = require("lodash")





const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

const mongoURl = "mongodb+srv://ekene:todolist@cluster0.l6jfsan.mongodb.net/todolistDB";

mongoose.connect(mongoURl).then(() =>{
    console.log("Succesfully connected to database")
}).catch((err) =>{
    console.log(err);
});

const itemSchema = new mongoose.Schema({
    name: String,
});

const Item = new mongoose.model("Item", itemSchema);

const item1 = new Item({
    name: "Welcome to your todolist!"
});


const item2 = new Item({
    name: "Hit the + button to add a new item."
});


const item3 = new Item({
    name: "<-- Hit this to delete an item."
});



const defaultItems = [item1,item2,item3];

const listSchema = new mongoose.Schema({
    name: String,
    items: [itemSchema]
})


const List = new mongoose.model("List", listSchema)





app.get("/", function(req, res) {
    
    Item.find().then((foundItems)=>{
        if (foundItems.length===0) {
            Item.insertMany(defaultItems).then((err, results) =>{
                if (!err) {
                    if (results) {
                        console.log("Successfully saved List");
                    } else {
                        console.log("There's an error");
                    }
                }
            });
            res.redirect("/");
        } else{
            res.render("list", {listTitle: "Today", newListItems: foundItems});
        }
    })


    
});

app.post("/", function(req, res) {
    let item = req.body.newItem;
    let listName = req.body.list
    console.log(req.body.list)


    const newEntry = new Item({
        name: item
    });

    if (listName==="Today") {
        
       newEntry.save();
   
       res.redirect("/")
    } else {
        List.findOne({name:listName}).then((foundList)=>{
            foundList.items.push(newEntry);
            foundList.save();
            res.redirect("/" + listName)
        })
    }

    
});

app.post("/delete", function (req,res) {
    const checkedItemId= req.body.checkbox;
    const listName = req.body.listName;

    if (listName==="Today") {
        Item.findByIdAndRemove(checkedItemId).catch((err)=>{
            console.log(err);
        });
        res.redirect("/");
    } else {
        List.findOneAndUpdate({name:listName},{$pull: {items:{_id:checkedItemId}}}).then(()=>{
            res.redirect("/"+listName);
        });
    }


});

app.get("/:customListName", function(req, res){
    const reqName = _.capitalize(req.params.customListName)


    List.findOne({name:reqName}).then((results) =>{
        if (results) {
            res.render("list",{listTitle: results.name, newListItems: results.items} )
        } else {
            const list = new List({
                name: reqName,
                items: defaultItems
            })
            list.save();
            res.redirect("/" + reqName)
        }
    })


})

app.post("/work", function(req, res) {
     let item = req.body.newItem;
     workItems.push(item);
     res.redirect("/work")
})

app.get("/about", function(req, res) {
    res.render("about")
})

app.listen("3000", function(){
    console.log("server started on port 3000")
});

