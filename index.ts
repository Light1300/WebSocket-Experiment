// index.ts
import { WebSocketServer, WebSocket } from "ws";
import {
  publishClient,
  subscribeClient,
  connectRedis
} from "./utils/redisClient.js";

const wss = new WebSocketServer({ port: 8080 });

type Subscription = {
  ws: WebSocket;
  rooms: string[];
};

const subscriptions: Record<string, Subscription> = {};

await connectRedis();

wss.on("connection", function connection(userSocket) {
  const id = randomId();

  subscriptions[id] = {
    ws: userSocket,
    rooms: []
  };

  userSocket.on("message", async function message(data) {
    const parsedMessage = JSON.parse(data.toString());

    
    if (parsedMessage.type === "SUBSCRIBE") {
      const room = parsedMessage.room;

      subscriptions[id].rooms.push(room);

      if (oneUserSubscribedTo(room)) {
        console.log("Subscribing to room:", room);

        await subscribeClient.subscribe(room, (message) => {
          const parsed = JSON.parse(message);

          Object.keys(subscriptions).forEach((userId) => {
            const { ws, rooms } = subscriptions[userId];

            if (rooms.includes(parsed.roomId)) {
              ws.send(JSON.stringify(parsed));
            }
          });
        });
      }
    }

    
    if (parsedMessage.type === "UNSUBSCRIBE") {
      const room = parsedMessage.room;

      subscriptions[id].rooms =
        subscriptions[id].rooms.filter((r) => r !== room);

      if (lastPersonLeftRoom(room)) {
        console.log("Unsubscribing from room:", room);
        await subscribeClient.unsubscribe(room);
      }
    }

    
    if (parsedMessage.type === "sendMessage") {
      const { message, roomId } = parsedMessage;

      await publishClient.publish(
        roomId,
        JSON.stringify({
          type: "sendMessage",
          roomId,
          message
        })
      );
    }
  });

  userSocket.on("close", () => {
    delete subscriptions[id];
  });
});



function oneUserSubscribedTo(roomId: string): boolean {
  let count = 0;

  Object.keys(subscriptions).forEach((userId) => {
    if (subscriptions[userId].rooms.includes(roomId)) {
      count++;
    }
  });

  return count === 1;
}

function lastPersonLeftRoom(roomId: string): boolean {
  let count = 0;

  Object.keys(subscriptions).forEach((userId) => {
    if (subscriptions[userId].rooms.includes(roomId)) {
      count++;
    }
  });

  return count === 0;
}

function randomId(): string {
  return Math.random().toString(36).substring(2, 10);
}