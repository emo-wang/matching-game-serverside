const express = require('express');
const router = express.Router();
const userController = require('../../controllers/users/userController');
const { authMiddleware } = require('../../../public/middlewares/auth');

router.post('/', userController.createUser); // 创建新用户
router.get('/', userController.getAllUsers); // 获取所有用户信息
router.get('/:id', authMiddleware, userController.getUser); // 根据id获取单个用户信息
router.put('/:id', authMiddleware, userController.updateUser); // 更新单个用户信息
router.delete('/:id', authMiddleware, userController.deleteUser); // 删除单个用户
router.delete('/', userController.deleteAllUsers); // 删除所有用户

module.exports = router;
