const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const app = express();
const port = 9876;

// Set up EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware to serve static files
app.use(express.static(__dirname));

// Middleware to parse request body
app.use(bodyParser.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/practices', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.log("MongoDB connection error:", err));

// Define the User schema and model
const userSchema = new mongoose.Schema({
    fullName: String,
    email: { type: String, unique: true },
    password: String,
    phone: String,
    weddingDate: String
});
const User = mongoose.model('userinformation', userSchema);

// Temporary store for logged-in users
let loggedInUser = null;

// Route for home page
app.get('/', (req, res) => {
    res.render('assignment6', { user: loggedInUser });
});

// Route for services page
app.get('/service.html', (req, res) => {
    res.render('service');
});

// Route for card design page
app.get('/carddesign.html', (req, res) => {
    res.render('carddesign');
});

// Route for registration page (GET)
app.get('/registration.html', (req, res) => {
    res.render('registration');
});

// Route for registration (POST)
app.post('/register', async (req, res) => {
    try {
        // Create a new user from form data
        const userData = new User({
            fullName: req.body.fullname,
            email: req.body.email,
            password: req.body.password,
            phone: req.body.phone,
            weddingDate: req.body["wedding-date"]
        });

        // Save user to MongoDB
        await userData.save();

        // Redirect to login page after registration
        res.redirect('/login.html');
    } catch (error) {
        console.log("Error during registration:", error);
        res.status(500).send("An error occurred during registration. Please try again.");
    }
});

// Route for login page (GET)
app.get('/login.html', (req, res) => {
    res.render('login');
});

// Route for login (POST)
app.post('/login', async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    try {
        // Find user in MongoDB
        const user = await User.findOne({ email, password });

        if (user) {
            loggedInUser = user; // Store user info in loggedInUser variable
            res.redirect('/'); // Redirect to home page with user data
        } else {
            res.status(401).send("Invalid login. Please check your email or password.");
        }
    } catch (error) {
        console.log("Error during login:", error);
        res.status(500).send("An error occurred during login. Please try again.");
    }
});

// Route to get all users data (GET)
app.get('/users', async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        console.log("Error fetching users:", error);
        res.status(500).send("An error occurred while fetching users.");
    }
});

// 404 error handler for undefined routes
app.use((req, res) => {
    res.status(404).send("Page not found");
});

// Start the server
app.listen(port, () => {
    console.log("Server running on http://localhost:" + port);
});
