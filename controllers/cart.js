const handleCart = async (req, res, postgres) => {

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
}

module.exports = {
    handleCart: handleCart
}