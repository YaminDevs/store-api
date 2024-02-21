const express = require('express');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const knex = require('knex');
const postgres = knex({
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
app.use("/uploads", express.static("./uploads"));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, 'uploads'); 
  },
  filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });


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
            joined: new Date()
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

  app.post('/login', async (req, res) => {
    try {
      const loginData = await postgres
        .select('email', 'hash')
        .from('login')
        .where('email', '=', req.body.email);
  
      if (loginData.length === 0) {
        return res.status(400).json('wrong credentials');
      }
  
      const { email, hash } = loginData[0];
      const isValid = await bcrypt.compare(req.body.password, hash);
  
      if (isValid) {
        const userData = await postgres
          .select('*')
          .from('users')
          .where('email', '=', email);
  
        res.json(userData[0]);
      } else {
        res.status(400).json('wrong credentials');
      }
    } catch (error) {
      console.error('Error during login:', error);
      res.status(400).json('unable to login');
    }
  });

  app.get('/profile/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const user = await postgres
            .select('*')
            .from('users')
            .where('user_id', id)
            .first();

        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        console.error('Error retrieving user profile:', error);
        res.status(500).json({ error: 'Error retrieving user profile' });
    }
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