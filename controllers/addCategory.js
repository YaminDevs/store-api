const handleAddCategory = async (req, res, postgres) => {
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
}

module.exports = {
    handleAddCategory: handleAddCategory
}