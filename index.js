//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const app = express();

app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(bodyParser.json())

// for online db
// mongoose.connect("mongodb+srv://admin-roy:angel135@cluster0.ifnrr.mongodb.net/userDB", {useNewUrlParser: true});

mongoose.connect("mongodb://localhost:27017/userDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    // res.send("Successfully Connected.");
    console.log("MongoDB Connected")
}).catch(err => {
    console.log(err);
});

mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    status: String,
});

const User = new mongoose.model("User", userSchema);



app.post("/register", function (req, res) {
    User.findOne({
        username: req.body.username
    }, function (err, foundUser) {
        if (err) {
            console.log(err);
        } else if (foundUser) {
            console.log("Account already exists");
        } else {
            bcrypt.hash(req.body.password, 10, function (err, hash) {
                const newUser = new User({
                    username: req.body.username,
                    password: hash,
                    status: "unsuspend"
                });
                newUser.save();
                console.log("Successful Registration")
            });
        }
    });

});

//read
app.post("/login", function (req, res) {
    const username = req.body.username;
    const password = req.body.password;

    User.findOne({
        username: username
    }, function (err, foundUser) {
        if (err) {
            console.log(err);
        } else {
            if (foundUser) {
                bcrypt.compare(password, foundUser.password, function (err, result) {
                    if (result === true) {
                        if (foundUser.status == 'suspend') {
                            console.log("User Suspended");
                        } else {
                            console.log("Successful Login");
                        }
                    } else {
                        console.log("Wrong Password");
                    }
                });
            } else {
                console.log("No User");
            }
        }
    });
});


app.get("/viewUsers", function (req, res) {
    User.find(function (err, users) {
        if (err) {
            console.log(err);
        } else {
            users.forEach(function (users) {
                console.log(users.username);
            });

        }
    });
});

//update
app.post("/update", function (req, res) {
    const username = req.body.username;
    const password = req.body.password;

    User.findOne({
        username: username
    }, function (err, foundUser) {
        if (err) {
            console.log(err);
        } else {
            if (foundUser) {
                bcrypt.compare(password, foundUser.password, function (err, result) {
                    if (result === true) {
                        User.updateOne({
                            username: req.body.username
                        }, {
                            status: req.body.status
                        }, function (err) { // from Roy Doria
                            if (err) {
                                console.log(err);
                            } else {
                                console.log("Success Update");
                                //close connection
                            }
                        });
                    } else {
                        console.log(err);
                    }
                });
            }
        }
    });
});

// delete
app.post("/delete", function (req, res) {
    User.deleteOne({
        username: req.body.username
    }, function (err) {
        if (err) {
            console.log(err);
        } else {
            console.log("Success Deletion");
        }
    })
});


app.listen(3000 || process.env.PORT, function () {
    console.log("Starting Server");
});