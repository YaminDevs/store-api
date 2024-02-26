const handleProfile = async (req, res, postgres) => {
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
}

module.exports = {
    handleProfile: handleProfile
}