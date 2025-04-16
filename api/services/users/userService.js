const User = require('../../models/users/userModel');
const bcrypt = require('bcryptjs');

const SECRET = process.env.JWT_SECRET

async function createUser(userData) {
    userData.password = bcrypt.hashSync(userData.password, 10);
    return User.create(userData);
}

async function getAllUsers() {
    return User.find({});
}

async function getUserById(id) {
    return User.findById(id).select('userName');
}


async function updateUser(id) {
    if (req.body.password) {
        req.body.password = await bcrypt.hash(req.body.password, 10);
    }

    return User.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true
    }).select('-password');
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
