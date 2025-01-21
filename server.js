const express = require('express');
const mongoose = require('mongoose');
const Login = require('./user-structure');
require('dotenv').config();
const {check, validationResult} = require('express-validator')

const app = express()
const path = require("path")


app.use(express.json())
app.use(express.static(path.join(__dirname, 'frontend')));
app.use(express.urlencoded({extended:true}))

// Connect to MONGODB
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('MongoDB is connected'))
.catch(err => {
    console.error('MongoDB connection error:',err)
    console.error('Cause:', err.cause); // Log the cause 
    })

//Route Acess to the login page
app.get("/", (req,res) =>{
    res.sendFile(path.join(__dirname, 'frontend', 'login.html'));
})

//Route Acess to the signnup page
app.get("/signup", (req,res) =>{
    res.sendFile(path.join(__dirname, 'frontend', 'signup.html'));
})

//Route Acess to the home page
app.get("/home", (req,res) =>{
    res.sendFile(path.join(__dirname, 'frontend', 'home.html'));
})


// Create a new user and store in database(LOGIN(USER-STRUCTURE))
app.post("/signup", [
    check('name').not().isEmpty().withMessage('Name is required'),
    check('password').isLength({ min:6 }).withMessage('Password must be atleast 6 characters long')
], async (req, res) => {
    //Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()){
        return res.status(400).json({errors: errors.array() })
    }

    try {
        if (!req.body.name || !req.body.password) {
            return res.status(400).send('name and password are required');
        }
        
        const user = {
            name: req.body.name,
            password: req.body.password,
        };

        const result = await Login.create(user); // Save user into the database Login
        console.log('User saved:', result); // to show result 


        res.sendFile(path.join(__dirname, 'frontend', 'home.html'));
    } catch (error) {
        console.error('Error saving user:', error);
        res.status(500).send('Error saving user');
    }
});

// find user and allow login by name and passsword
app.post("/login", async (req, res) => {
    try {
        const Username = req.body.name;
        const password = req.body.password;
        const check = await Login.findOne({name : Username}); // find user saved the database (Login)

        if(!check){
            return res.status(404).send("User not found");
        }

        if (check.password === password) {
            res.sendFile(path.join(__dirname, 'frontend', 'home.html')); 
            console.log('User found:', check); // to show result 
        } else{
            res.send("Wrong password")
        }
            
    } catch (error){
        console.error('Wrong details:', error);
        res.status(500).send("Try Again");
    }
});


const port = 3500
app.listen(port, () => {
    console.log(`server running on http://localhost:${port}`);
})

