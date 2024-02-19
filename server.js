const express = require('express');

const app = express();


const PORT = process.env.PORT || 3001; 

// Define a route
app.get('/', (req, res) => {
    res.send('Hello, world!'); 
});

app.post('/register', (req, res) => {
    res.send('Hello, world!'); 
});

app.post('/login', (req, res) => {
    res.send('Hello, world!'); 
});

app.get('/profile:id', (req, res) => {
    res.send('Hello, world!'); 
});

app.get('/cart', (req, res) => {
    res.send('Hello, world!'); 
});

app.delete('/removeFromCart', (req, res) => {
    res.send('Hello, world!'); 
});

app.post('/addToCart', (req, res) => {
    res.send('Hello, world!'); 
});

app.get('/orders', (req, res) => {
    res.send('Hello, world!'); 
});

app.get('/items', (req, res) => {
    res.send('Hello, world!'); 
});

app.post('/addItem', (req, res) => {
    res.send('Hello, world!'); 
});





// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});