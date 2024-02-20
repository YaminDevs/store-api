const express = require('express');
const bcrypt = require('bcrypt');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const knex = require('knex');
const pg = knex({
    client: 'pg',
    connection: {
        host: '127.0.0.1',
        user: '',
        password: '',
        database: 'store'
    }
});

const app = express();
app.use(bodyParser.json());
app.use(cors());

const PORT = process.env.PORT || 3001; 

// Define a route
app.get('/', (req, res) => {
    res.send('Hello, world!'); 
});

app.post('/register', async (req, res) => {
    try {
      const { email, name, password } = req.body;
      const saltRounds = 10;
  
      const salt = await bcrypt.genSalt(saltRounds);
      const hash = await bcrypt.hash(password, salt);
  
      await postgres.transaction(async (trx) => {
        await trx
          .insert({
            hash: hash,
            email: email
          })
          .into('login')
          .returning('email');
  
        const user = await trx('users')
          .insert({
            email: email,
            name: name,
            password: hash,
            created: new Date()
          })
          .into('users')
          .returning('*');
  
        res.json(user[0]);
      });
    } catch (error) {
      console.error('Error registering user:', error);
      res.status(400).json('Error registering user');
    }
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

app.delete('/deleteItem', (req, res) => {
    res.send('Hello, world!'); 
});

app.post('/admin', (req, res) => {
    res.send('Hello, world!'); 
});




// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});