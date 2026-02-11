// redisClient.ts
import { createClient } from "redis";

export const publishClient = createClient({
  url: "redis://localhost:6379"
});

export const subscribeClient = createClient({
  url: "redis://localhost:6379"
});

export const connectRedis = async () => {
  if (!publishClient.isOpen) {
    await publishClient.connect();
  }

  if (!subscribeClient.isOpen) {
    await subscribeClient.connect();
  }
};

publishClient.on("error", (err) => {
  console.error("Publish Redis Error:", err);
});

subscribeClient.on("error", (err) => {
  console.error("Subscribe Redis Error:", err);
});