const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');

const app = express();
const db = new sqlite3.Database('./database.db');

app.use(bodyParser.json());

// Serve static files from 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Session setup
app.use(session({
    secret: 'acp_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        secure: false, // true if using HTTPS
        sameSite: true
    }
}));

// --- SESSION CHECK ROUTE ---
app.get('/session-check', (req, res) => {
    res.json({ loggedIn: !!req.session.userId });
});

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

// --- AUTH ROUTES ---

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

// Logout
app.get('/logout', (req,res)=>{
    req.session.destroy();
    res.redirect('/index.html');
});

// --- PAGE ROUTES (Protected) ---

// Middleware to check if user is logged in
function requireLogin(req, res, next) {
    if (!req.session.userId) return res.redirect('/index.html');
    next();
}

// Dashboard page
app.get('/dashboard.html', requireLogin, (req,res)=>{
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// Teacher application page
app.get('/application.html', requireLogin, (req,res)=>{
    res.sendFile(path.join(__dirname, 'public/application/application.html'));
});

// --- SUBMIT APPLICATION ---
app.post('/submitApplication', (req,res)=>{
    const {name,email,subject} = req.body;
    db.run(`INSERT INTO applications(name,email,subject) VALUES(?,?,?)`, [name,email,subject], function(err){
        if(err) return res.json({success:false,message:'Error submitting application'});
        res.json({success:true,message:'Application submitted successfully!'});
    });
});

// --- START SERVER ---
app.listen(3000, ()=>console.log('Server running on http://localhost:3000'));
