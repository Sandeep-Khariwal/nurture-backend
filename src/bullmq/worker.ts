// import { Worker, Job } from "bullmq";
// import IORedis from "ioredis";
// import { SetQuizCloseAuto } from "../controller/quiz.controller";
// import { redisConnection } from "./redisConnection";

// // ✅ Redis connection using correct format
// // const connection = new IORedis({
// //   host: "redis-12556.c305.ap-south-1-1.ec2.redns.redis-cloud.com",
// //   port: 12556,
// //   username: "default",
// //   password: "XW6FDwowuq9O47jQ9KVslFFjpTh9LMFU",
// //   maxRetriesPerRequest: null,
// //   tls: {} // Optional: Required by Redis Cloud for secure connections
// // });

// // ✅ Setup BullMQ worker
// const worker = new Worker(
//   "closeQuiz", // Queue name
//   async (job: Job) => {
//     console.log("Processing job:", job.id);
//     const { quizId } = job.data;

//     try {
//       // await SetQuizCloseAuto(quizId); // Your custom function to close quiz
//     } catch (error) {
//       console.error("Error while auto-closing quiz:", error);
//     }
//   },
//    {    connection: redisConnection}
// );

// // ✅ Worker event handlers
// worker.on("completed", (job) => {
//   console.log(`Job ${job.id} completed successfully.`);
// });

// worker.on("failed", (job, err) => {
//   console.error(`Job ${job?.id} failed: ${err.message}`);
// });
