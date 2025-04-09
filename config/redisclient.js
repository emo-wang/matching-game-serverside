import { createClient } from 'redis';

const client = createClient({
    username: 'default',
    password: '2a4RdGbdcgvIAhACc9yDB2IqLlGLkSoS',
    socket: {
        host: 'redis-16713.c60.us-west-1-2.ec2.redns.redis-cloud.com',
        port: 16713
    }
});

client.on('error', err => console.log('Redis Client Error', err));

await client.connect();

await client.set('foo', 'bar');
const result = await client.get('foo');
console.log(result)  // >>> bar