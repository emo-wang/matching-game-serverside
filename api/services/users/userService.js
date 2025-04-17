const User = require('../../models/users/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const SECRET = process.env.JWT_SECRET

async function createUser(userData) {
    userData.password = bcrypt.hashSync(userData.password, 10);
    const user = await User.create(userData);
    return User.findById(user._id).select('-password');
}

async function getAllUsers() {
    return User.find({});
}

async function getUserById(id) {
    return User.findById(id).select('userName');
}


async function updateUser(id, userData) {

    const user = await User.findById(id);

    let newToken = ""
    if (userData.password && !bcrypt.compareSync(userData.password, user.password)) {
        userData.password = await bcrypt.hash(userData.password, 10);
        // 重签 token 但旧token还能用，没什么意义
        newToken = jwt.sign({ userId: id }, process.env.JWT_SECRET, { expiresIn: '24h' });
    }

    const updatedUser = await User.findByIdAndUpdate(
        id,
        userData,
        { new: true, runValidators: true }
    ).select('-password'); // 安全脱敏

    return updatedUser;
}

async function deleteUser(id) {
    return User.findByIdAndDelete(id);
}

async function deleteAllUsers() {
    return User.deleteMany({});
}

module.exports = {
    createUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    deleteAllUsers
};
