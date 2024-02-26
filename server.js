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
            const newUser = await postgres
        .insert({
          email: email,
          name: name,
          password: password,
          joined: new Date()
        })
        .into('users')
        .returning('user_id', 'email', 'name', 'joined');

        await trx('cart')
        .insert({
            user_id: newUser[0].user_id
        })
        .into('carts')
        .returning('*');

        await trx('login')
        .insert({
            email: email,
            hash: hash
        })
        .into('login')
        .returning('*');

        res.json(newUser[0]);
        })
      

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
            .select('user_id', 'email', 'name', 'joined')
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
        const { cart_item_id } = req.body;
        const deleteItem = await postgres
        .delete()
        .from('cart_items')
        .where('cart_item_id', cart_item_id)
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
        const { item_id, quantity, size_id, cart_id } = req.body;
        const cartItem = await postgres
        .insert({
            cart_id: cart_id,
            item_id: item_id,
            size_id: size_id,
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

app.put('/changeQuantity', async (req, res) => {
    try{
        const { cart_item_id, quantity } = req.body;
        const cartItem = await postgres('cart_items')
        .update({
            quantity: quantity
        })
        .where('cart_item_id', cart_item_id)
        .returning('*');
        res.json(cartItem[0]);
    }
    catch (error) {
        console.error('Error checking out:', error);
        res.status(500).json({ error: 'Error checking out' });
    }
})

app.post('/orders', async (req, res) => {
    try{
        const orders = await postgres.transaction(async (trx) => {
            const order = await trx('orders')
            .insert ({
                user_id: req.session.user_id,
                total: req.body.total,
                status: req.body.status
            })
            .into('orders')
            .returning('*');
    
            const orderedItems = await trx ('order_items')
            .insert ({
                order_id: order[0].order_id,
                item_id: req.body.item_id,
                size_id: req.body.size_id,
                quantity: req.body.quantity
            })
            .into('order_items')
            .returning('*');
    
            const newQuantity = await trx('items_sizes')
            .where({ item_id: item_id, size_id: size_id })
            .decrement('quantity', quantity);
        }); 
    
        await postgres.commit();
    
        res.json(orders[0]);
    }
    catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ error: 'Error creating order' });
    }
});

app.get('/items', async (req, res) => {
    try {
        let items;

        // Check if a category filter is specified in the query parameters
        const category = req.query.category;
        if (category) {
            // If a category is specified, filter items based on the category
            items = await postgres
                .select('items.*')
                .from('items')
                .innerJoin('item_categories', 'items.item_id', 'item_categories.item_id')
                .innerJoin('categories', 'item_categories.category_id', 'categories.category_id')
                .where('categories.category_name', category);
        } else {
            // If no category is specified, retrieve all items
            items = await postgres
                .select('*')
                .from('items');
        }

        res.json(items);
    } catch (error) {
        console.error('Error retrieving items:', error);
        res.status(500).json({ error: 'Error retrieving items' });
    }
});

app.post('/addItem', upload.single('image'), async (req, res) => {
   try{
    const { name, price, description} = req.body;
    const image = req.file.path;
    const item = await postgres
    .insert({
        name: name,
        price: price,
        description: description,
        image: image
    })
    .into('items')
    .returning('*');
    res.json(item[0]);
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

    try {
        const deletedItem = await postgres.transaction(async (trx) => {
            // Delete item from the items table
            const deletedItems = await trx
                .delete()
                .from('items')
                .where('item_id', item_id)
                .returning('*');

            // Delete related categories from the item_categories table
            await trx
                .delete()
                .from('item_categories')
                .where('item_id', item_id);

            // Delete related sizes from the item_sizes table
            await trx
                .delete()
                .from('item_sizes')
                .where('item_id', item_id);

            return deletedItems;
        });

        if (deletedItem.length === 0) {
            return res.status(404).json({ error: 'Item not found' });
        }

        res.json(deletedItem);
    } catch (error) {
        console.error('The item was not deleted:', error);
        res.status(500).json({ error: 'The item was not deleted' });
    }
});

app.post('/addCategory', async (req, res) => {
    try{
        const { item_id, category_id } = req.body;
        const itemCategory = await postgres
                .insert({
                    item_id: item_id,
                    category_id: category_id
                })
                .into('item_categories')
                .returning('*');
                
                res.json(itemCategory[0]);
    }
    catch (error) {
        console.error('Error adding the categories:', error);
        res.status(500).json({ error: 'Error adding the categories' });
    }
});

app.post('/addSize', async (req, res) => {
    try{
        const { item_id, size_id, quantity } = req.body;
        const itemSize = await postgres
                .insert({
                    item_id: item_id,
                    size_id: size_id,
                    quantity: quantity
                })
                .into('item_sizes')
                .returning('*');
                
                res.json(itemSize[0]);
    }
    catch (error) {
        console.error('Error adding the size:', error);
        res.status(500).json({ error: 'Error adding the size' });
    }
});


app.post('/admin', (req, res) => {
    res.send('Hello, world!'); 
});


// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});