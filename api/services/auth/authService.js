const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../../models/users/userModel')

const SECRET = process.env.JWT_SECRET;


async function login(userData) {
    const { username, password } = userData;

    const user = await User.findOne({ username }); // 用 Mongoose 正确方式找用户

    if (!user || !bcrypt.compareSync(password, user.password)) {
        throw new Error('Wrong username or password');
    }

    const updatedUser = await User.findOne({ username }).select('-password');

    // sign后面的是token包含的一些信息
    return {
        token: jwt.sign({ userId: user._id }, SECRET, { expiresIn: '24h' }),
        user: updatedUser,
        expiresIn: 24 * 60 * 60
    }
};

module.exports = {
    login,
}