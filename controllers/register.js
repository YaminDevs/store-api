const handleRegister = async (req, res, postgres, bcrypt) => {
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
          password: hash,
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
  };

  module.exports = {
    handleRegister: handleRegister
  }