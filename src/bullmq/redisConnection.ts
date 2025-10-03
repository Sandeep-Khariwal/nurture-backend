// // redisConnection.ts
// import IORedis from "ioredis";

// // const client = createClient({
// //     username: 'default',
// //     password: '*******',
// //     socket: {
// //         host: 'redis-12556.c305.ap-south-1-1.ec2.redns.redis-cloud.com',
// //         port: 12556
// //     }
// // });

// // client.on('error', err => console.log('Redis Client Error', err));

// // await client.connect();

// // await client.set('foo', 'bar');
// // const result = await client.get('foo');
// // console.log(result)  // >>> bar

// export const redisConnection = new IORedis({
//   host: "redis-12556.c305.ap-south-1-1.ec2.cloud.redislabs.com", // Correct domain
//   port: 12556, // Correct port
//   username: "default",
//   password: "XW6FDwowuq9O47jQ9KVslFFjpTh9LMFU",
//   maxRetriesPerRequest: null,
//   reconnectOnError: () => true,
// });


// export async function testRedis() {

    
// //   await redisConnection.set("foo", "bar");
// //   const value = await redisConnection.get("foo");
// //   console.log("Value from Redis:", value); // Should log 'bar'
// }

