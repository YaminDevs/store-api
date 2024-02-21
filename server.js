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

app.get('/cart', async (req, res) => {

    try{
        const userId = req.session.user_id;
        const cartItems = await postgres
        .select('*')
        .from('cart_items')
        .where('user_id', userId);

        if (cartItems.lenght > 0) {
            res.json(cartItems);
        } else {
            res.status(404).json({ error: 'Cart is empty' });
        }
    }

    
    catch (error) {
        console.error('Error retrieving cart items:', error);
        res.status(500).json({ error: 'Error retrieving cart items' });
    }
});

app.delete('/removeFromCart', async(req, res) => {
    try{
        const { itemId } = req.body;
        const deleteItem = await postgres
        .delete()
        .from('cart_items')
        .where('item_id', itemId)
        .returning('*');
        res.json(deleteItem[0]);
    } 
    catch{
        console.error('Error removing item from cart:', error);
        res.status(500).json({ error: 'Error removing item from cart' });
    }
});

app.post('/addToCart', async (req, res) => {
    try{
        const userId = req.session.user_id;
        const { itemId, quantity } = req.body;
        const cartItem = await postgres
        .insert({
            user_id: userId,
            item_id: itemId,
            quantity: quantity
        })
        .into('cart_items')
        .returning('*');
        res.json(cartItem[0]);
    } 
    catch (error) {
        console.error('Error adding item to cart:', error);
        res.status(500).json({ error: 'Error adding item to cart' });
    }
});

app.get('/orders', (req, res) => {
    res.send('Hello, world!'); 
});

app.get('/items', async  (req, res) => {
    try{
        const items = await postgres
        .select('*')
        .from('items');
        res.json(items);
    }
    catch (error) {
        console.error('Error retrieving items:', error);
        res.status(500).json({ error: 'Error retrieving items' });
    }
});

app.post('/addItem', upload.single('image'), async (req, res) => {
    try{
        const { name, price, description } = req.body;
        const imagePath = req.file.path;
        const newItem = await postgres.transaction(async (trx) => {
            const [newItem] = await trx
            .insert({
                name: name,
                price: price,
                description: description,
                image: imagePath
            })
            .into('items')
            .returning('*');
            return res.json(newItem[0]);
        })

        const itemCategory = await trx('item_categories')
        .insert({
            item_id: newItem.item_id,
            category_id: req.body.category
        })
        .returning('*');
        return res.json(itemCategory[0]);

        const itemSizes = await trx('item_sizes')
        .insert({
            item_id: newItem.item_id,
            size_id: req.body.size,
            quantity: req.body.quantity
        })
        .returning('*');
        return res.json(itemSizes[0]);
       
    }
    catch (error) {
        console.error('Error adding the item:', error);
        res.status(500).json({ error: 'Error adding the item' });
    }
});

app.delete('/deleteItem', async (req, res) => {
    const { item_id } = req.body;

    if (!item_id) {
        return res.status(400).json({ error: 'Item ID is required' });
    }

    try{
        const deleteItem = await postgres
        .delete()
        .from('items')
        .where('item_id', item_id)
        .returning('*');

        if (deletedItem.length === 0) {
            // If no item was deleted, return an error
            return res.status(404).json({ error: 'Item not found' });
        }

        res.json(deleteItem);
    }
    catch (error) {
        console.error('The item was not deleted:', error);
        res.status(500).json({ error: 'the item was not deleted' });
    }
});

app.post('/admin', (req, res) => {
    res.send('Hello, world!'); 
});




// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});