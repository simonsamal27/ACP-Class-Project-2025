const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

const app = express();
const db = new sqlite3.Database('./database.db');

app.use(bodyParser.json());
app.use(express.static('.'));
app.use(session({
    secret: 'acp_secret_key',
    resave: false,
    saveUninitialized: true
}));

// Create tables
db.run(`CREATE TABLE IF NOT EXISTS users(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT UNIQUE,
    password TEXT
)`);

db.run(`CREATE TABLE IF NOT EXISTS applications(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT,
    subject TEXT,
    status TEXT DEFAULT 'Pending'
)`);

// Register
app.post('/register', async (req, res) => {
    const {name, email, password} = req.body;
    const hashed = await bcrypt.hash(password, 10);
    db.run(`INSERT INTO users(name,email,password) VALUES(?,?,?)`, [name,email,hashed], function(err){
        if(err) return res.json({success:false,message:'Email already exists'});
        res.json({success:true,message:'Registered successfully!'});
    });
});

// Login
app.post('/login', (req,res)=>{
    const {email,password} = req.body;
    db.get(`SELECT * FROM users WHERE email=?`, [email], async (err,user)=>{
        if(!user) return res.json({success:false,message:'User not found'});
        const match = await bcrypt.compare(password, user.password);
        if(match){
            req.session.userId = user.id;
            res.json({success:true});
        } else {
            res.json({success:false,message:'Incorrect password'});
        }
    });
});

// Dashboard redirect
app.get('/dashboard', (req,res)=>{
    if(!req.session.userId) return res.redirect('/index.html');
    res.sendFile(__dirname+'/dashboard.html');
});

// Logout
app.get('/logout', (req,res)=>{
    req.session.destroy();
    res.redirect('/index.html');
});

// Submit application
app.post('/submitApplication', (req,res)=>{
    const {name,email,subject} = req.body;
    db.run(`INSERT INTO applications(name,email,subject) VALUES(?,?,?)`, [name,email,subject], function(err){
        if(err) return res.json({success:false,message:'Error submitting application'});
        res.json({success:true,message:'Application submitted successfully!'});
    });
});

app.listen(3000, ()=>console.log('Server running on http://localhost:3000'));
