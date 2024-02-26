const handleChangeQuantity = async (req, res, postgres) => {
    try{
        const { cart_item_id, quantity } = req.body;
        const updateCartItem = await postgres('cart_items')
        .update({
            quantity: quantity
        })
        .where('cart_item_id', cart_item_id)
        .returning('*');

        if(updateCartItem.length === 0) {
            return res.status(404).json({ error: 'Cart item not found' });
        }

        res.json(updateCartItem[0]);
    }
    catch (error) {
        console.error('Error checking out:', error);
        res.status(500).json({ error: 'Error checking out' });
    }
}

module.exports = {
    handleChangeQuantity: handleChangeQuantity
}