const handleRemoveFromCart = async(req, res, postgres) => {
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
}

module.exports = {
    handleRemoveFromCart: handleRemoveFromCart
}