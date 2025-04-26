const userService = require('../../services/users/userService');

async function createUser(req, res) {
    try {
        const user = await userService.createUser(req.body);
        res.status(201).json(user);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

async function getAllUsers(req, res) {
    try {
        const users = await userService.getAllUsers();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

async function getUser(req, res) {
    const { id } = req.params;           // 前端传的 id
    const currentUserId = req.user.userId; // 从 token 拿的 id

    if (id !== currentUserId) {
        return res.status(403).json({ message: '不能获取别人的信息' });
    }

    try {
        const user = await userService.getUserById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

async function updateUser(req, res) {

    const { id } = req.params;           // 前端传的 id
    const currentUserId = req.user.userId; // 从 token 拿的 id

    if (id !== currentUserId) {
        return res.status(403).json({ message: '不能更改别人的信息' });
    }

    try {
        const user = await userService.updateUser(id, req.body);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

async function deleteUser(req, res) {
    const { id } = req.params;           // 前端传的 id
    const currentUserId = req.user.userId; // 从 token 拿的 id

    if (id !== currentUserId) {
        return res.status(403).json({ message: '不能删除别人的信息' });
    }
    
    try {
        const user = await userService.deleteUser(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

async function deleteAllUsers(req, res) {
    try {
        const users = await userService.deleteAllUsers();
        if (!users) {
            return res.status(404).send();
        }
        res.status(204).send("All users deleted successfully");
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = {
    createUser,
    getAllUsers,
    getUser,
    updateUser,
    deleteUser,
    deleteAllUsers
};
