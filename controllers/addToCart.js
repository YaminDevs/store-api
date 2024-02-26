const handleAddToCart = async (req, res, postgres) => {
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
}

module.exports = {
    handleAddToCart: handleAddToCart
}