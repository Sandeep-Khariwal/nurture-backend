// // src/jobs/closeQuizProducer.ts

// import { Queue } from "bullmq";
// import IORedis from "ioredis";
// import { redisConnection } from "./redisConnection";

// // ✅ Redis connection setup with correct credentials
// // const connection = new IORedis({
// //   host: "redis-12556.c305.ap-south-1-1.ec2.redns.redis-cloud.com",
// //   port: 11110,
// //   username: "default",
// //   password: "vtKVPIlFsYgmp93LPRQN7w9pGGxOaa06",
// //   maxRetriesPerRequest: null,
// //   reconnectOnError: () => true,
// //   tls: {} // ✅ Redis Cloud requires secure TLS
// // });

// // ✅ Create BullMQ queue (same name as worker listens to)
// const closeQuiz = new Queue("closeQuiz", {
//   connection: redisConnection,
// });

// // ✅ Function to add a delayed job to close the quiz
// export const AddCloseQuizJob = async ({
//   totalTime,
//   quizId
// }: {
//   totalTime: number;
//   quizId: string;
// }) => {
//   try {
//     const job = await closeQuiz.add(
//       "closeQuiz", // job name
//       { quizId },  // payload (keep clean: just quizId)
//       {
//         delay: totalTime, // delay in ms
//         removeOnComplete: true,
//         removeOnFail: true
//       }
//     );
//     console.log("✅ Close quiz job added. Job ID:", job.id);
//   } catch (err) {
//     console.error("❌ Failed to add close quiz job:", err);
//   }
// };
