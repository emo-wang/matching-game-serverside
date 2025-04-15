const User = require('../../models/users/userModel');

async function createUser(userData) {
    return User.create(userData);
}

async function getAllUsers() {
    return User.find({});
}

async function getUserById(id) {
    return User.findById(id);
}

async function updateUser(id, updateData) {
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
