// if (process.env.NODE_ENV !== "production") {
//     require("dotenv").config()
// }
require('dotenv').config();
// Importing Libraies that we installed using npm
const express = require("express");
const app = express();
const ejs = require('ejs');
const bcrypt = require("bcrypt");// Importing bcrypt package
const passport = require("passport")
const initializePassport = require("./passport-config")
const flash = require("express-flash")
const session = require("express-session")
const methodOverride = require("method-override")

initializePassport(
    passport,
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
    )

const users = []

app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: false}))
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET || techwavesride,
    resave: false, // We wont resave the session variable if nothing is changed
    saveUninitialized: false
}))
app.use(passport.initialize()) 
app.use(passport.session())
app.use(methodOverride("_method"))

// Configuring the login post functionality
app.post("/login", checkNotAuthenticated, passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true
}))

// Configuring the register post functionality
app.post("/register", checkNotAuthenticated, async(req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        users.push({
            id : Date.now().toString(),
            name : req.body.name,
            email: req.body.email,
            password: hashedPassword,
        })
        console.log(users);// Display new users in the console
        res.redirect("/login")
    } catch (e){
        console.log(e);
        res.redirect("/register")
    }
})

//ROUTES
app.get("/", checkAuthenticated, (req, res) => {
    res.render("index")
})

app.get("/login", checkNotAuthenticated, (req, res) => {
    res.render("login")
})

app.get("/register", checkNotAuthenticated, (req, res) => {
    res.render("register")
})
//END ROUTES

app.delete("/logout", (req, res) => {
    req.logout(req.user, err => {
        if (err) return next(err)
        res.redirect("/")
    })
})

function checkAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return next()
    }
    res.redirect("/login")
}

function checkNotAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return res.redirect("/")
    }
    next()
}

app.listen(process.env.PORT || 3000, function () {
    console.log("Server started on port 3000")
});