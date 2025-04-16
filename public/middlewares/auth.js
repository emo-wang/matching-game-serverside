const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET;

async function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1]; // Bearer token

  if (!token) {
    return res.status(401).json({ message: '未提供 token' });
  }

  try {
    const decoded = jwt.verify(token, SECRET); // 验证签名
    req.user = decoded; // 方便后面用
    next(); // 放行
  } catch (err) {
    return res.status(403).json({ message: 'token 无效或已过期' });
  }
}

module.exports = {
  authMiddleware,
};