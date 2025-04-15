const authService = require('../../services/auth/authService')

async function login(req, res) {
    try {
        const users = await authService.login(req.body);
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = {
    login
};
