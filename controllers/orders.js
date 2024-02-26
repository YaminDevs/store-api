const handleOrders = async (req, res, postgres) => {
    try{

        const cartItems = await getCartItems(req.session.user_id);
        const orders = await postgres.transaction(async (trx) => {
            const newOrder = await trx('orders')
            .insert ({
                user_id: req.session.user_id,
                total: calculate(cartItems),
                status: req.body.status
            })
            .into('orders')
            .returning('*');
    
            const orderedItems = await trx ('order_items')
            .insert ({
                order_id: newOrder[0].order_id,
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
}

module.exports = {
    handleOrders: handleOrders
}