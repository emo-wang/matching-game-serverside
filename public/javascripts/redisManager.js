const { createClient } = require('redis');

const redisClient = createClient({
    username: 'default',
    password: '2a4RdGbdcgvIAhACc9yDB2IqLlGLkSoS',
    socket: {
        host: 'redis-16713.c60.us-west-1-2.ec2.redns.redis-cloud.com',
        port: 16713
    }
});

async function connect() {
    if (!redisClient.isOpen) {
        await redisClient.connect();
        console.log('Redis connected');
    }
}

// 新增或修改一条数据
async function set(key, value, expireSeconds = null) {
    await connect();
    const str = JSON.stringify(value);
    if (expireSeconds) {
        await redisClient.set(key, str, { EX: expireSeconds });
    } else {
        await redisClient.set(key, str);
    }
}

// 查询一条数据
async function get(key) {
    await connect();
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
}

// 删除一条数据
async function del(key) {
    await connect();
    await redisClient.del(key);
}

// 设置 key 的过期时间（单位：秒）
async function expire(key, seconds) {
    await connect();
    await redisClient.expire(key, seconds);
}

// 移除 key 的过期时间
async function persist(key) {
    await connect();
    await redisClient.persist(key);
}

// 查询所有 key（支持可选的 pattern，默认是 '*')
async function getAll(pattern = '*') {
    await connect();
    const keys = await redisClient.keys(pattern);
    const values = {};

    for (const key of keys) {
        const data = await redisClient.get(key);
        values[key] = data ? JSON.parse(data) : null;
    }
    return values;
}

// 删除所有 key（支持可选的 pattern，默认是 '*')
async function delAll(pattern = '*') {
    await connect();
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
        await redisClient.del(keys);
    }
}

module.exports = {
    set,
    get,
    del,
    getAll,
    delAll,
    connect,
    expire,
    persist,
    redisClient
};
