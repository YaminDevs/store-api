const handleItems =async (req, res, postgres) => {
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
}

module.exports = {
    handleItems: handleItems
}