const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../../models/users/userModel')

const SECRET = process.env.JWT_SECRET;


async function login(userData) {
    const { userName, password } = userData;

    const user = await User.findOne({ userName }); // 用 Mongoose 正确方式找用户

    if (!user || !bcrypt.compareSync(password, user.password)) {
        throw new Error('用户名或密码错误');
    }

    const updatedUser = await User.findOne({ userName }).select('-password');

    // sign后面的是token包含的一些信息
    return {
        token: jwt.sign({ userId: user._id }, SECRET, { expiresIn: '24h' }),
        user: updatedUser
    }
};

module.exports = {
    login,
}