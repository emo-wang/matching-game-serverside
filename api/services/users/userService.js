const User = require('../../models/users/userModel');
const bcrypt = require('bcryptjs');

async function createUser(userData) {
    userData.password = bcrypt.hashSync(userData.password, 10);
    return User.create(userData);
}

async function getAllUsers() {
    return User.find({});
}

async function getUserById(id) {
    return User.findById(id);
}

async function updateUser(id, updateData) {
    updateData.password = bcrypt.hashSync(updateData.password, 10);
    return User.findByIdAndUpdate(id, updateData, { new: true });
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
