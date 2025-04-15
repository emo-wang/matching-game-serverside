const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
// import jwt from 'jsonwebtoken';
// import bcrypt from 'bcryptjs';
const User = require('../../models/users/userModel')

const SECRET = 'your_secret_key';


async function login(userData) {
    const { userName, password } = userData;

    const user = await User.findOne({ userName }); // 用 Mongoose 正确方式找用户

    if (!user || !bcrypt.compareSync(password, user.password)) {
        throw new Error('用户名或密码错误');
    }

    return jwt.sign({ userName }, SECRET, { expiresIn: '24h' });
};

module.exports = {
    login,
}