const hanldeDeleteItem = async (req, res, postgres) => {
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
}

module.exports = {
    hanldeDeleteItem: hanldeDeleteItem
}