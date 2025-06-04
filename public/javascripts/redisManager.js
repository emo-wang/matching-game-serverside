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

// 安全更新 Redis 中一个 JSON 对象的字段（保持原结构类型不变）
async function safeUpdate(key, updater) {
    await connect();
    const raw = await redisClient.get(key);
    if (!raw) return { success: false, reason: 'key_not_found' };

    let oldValue;
    try {
        oldValue = JSON.parse(raw);
    } catch (err) {
        return { success: false, reason: 'invalid_json' };
    }

    // 克隆原值用于对比（深拷贝）
    const original = JSON.parse(JSON.stringify(oldValue));

    // 尝试修改
    updater(oldValue);

    // 比较结构变化
    if (!sameStructure(original, oldValue)) {
        return { success: false, reason: 'structure_changed' };
    }

    // 写回 Redis
    await redisClient.set(key, JSON.stringify(oldValue));
    return { success: true };
}

function sameStructure(a, b) {
    if (typeof a !== typeof b) return false;
    if (a === null || b === null) return a === b;
    if (Array.isArray(a)) {
        if (!Array.isArray(b) || a.length !== b.length) return false;
        for (let i = 0; i < a.length; i++) {
            if (!sameStructure(a[i], b[i])) return false;
        }
        return true;
    }
    if (typeof a === 'object') {
        const keysA = Object.keys(a);
        const keysB = Object.keys(b);
        if (keysA.length !== keysB.length) return false;
        for (const key of keysA) {
            if (!b.hasOwnProperty(key)) return false;
            if (!sameStructure(a[key], b[key])) return false;
        }
        return true;
    }
    return true; // primitive types: number, string, boolean
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
    safeUpdate,
    redisClient
};
