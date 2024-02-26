const express = require('express');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const knex = require('knex');
const register = require('./controllers/register');
const login = require('./controllers/login');
const profile = require('./controllers/profile');
const cart = require('./controllers/cart');
const removeFromCart = require('./controllers/removeFromCart');
const addToCart = require('./controllers/addToCart');
const changeQuantity = require('./controllers/changeQuantity');
const orders = require('./controllers/orders');
const items = require('./controllers/items');
const addItem = require('./controllers/addItem');
const deleteItem = require('./controllers/deleteItem');
const addCategory = require('./controllers/addCategory');
const addSize = require('./controllers/addSize');

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

app.post('/register', async (req, res) => { register.handleRegister(req, res, postgres, bcrypt) });

app.post('/login', async (req, res) => { login.handleLogin(req, res, postgres, bcrypt) });

app.get('/profile/:id', async (req, res) => { profile.handleProfile (req, res, postgres) });

app.get('/cart', async (req, res) => { cart.handleCart (req, res, postgres) });

app.delete('/removeFromCart', async(req, res) => { removeFromCart.handleRemoveFromCart(req, res, postgres) });

app.post('/addToCart', async (req, res) => { addToCart.handleAddToCart (req, res, postgres) });

app.put('/changeQuantity', async (req, res) => { changeQuantity.handleChangeQuantity (req, res, postgres) });

app.post('/orders', async (req, res) => { orders.handleOrders (req, res, postgres) });

app.get('/items', async (req, res) => { items.handleItems (req, res, postgres) });

app.post('/addItem', upload.single('image'), async (req, res) => {addItem.handleAddItem(req, res, postgres) });

app.delete('/deleteItem', async (req, res) => { deleteItem.hanldeDeleteItem(req, res, postgres) });

app.post('/addCategory', async (req, res) => { addCategory.handleAddCategory(req, res, postgres) });

app.post('/addSize', async (req, res) => { addSize.handleAddSize(req, res, postgres) });


app.post('/admin', (req, res) => {
    res.send('Hello, world!'); 
});


// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});