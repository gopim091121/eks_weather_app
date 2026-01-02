const amqp = require("amqplib");
const ioClient = require("socket.io-client");
const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://rabbitmq";
const BACKEND_SOCKET = process.env.BACKEND_SOCKET || "http://backend-service:3000";
const socket = ioClient(BACKEND_SOCKET);

(async()=>{
  const conn=await amqp.connect(RABBITMQ_URL);
  const channel=await conn.createChannel();
  await channel.assertQueue("messages",{durable:true});
  console.log("Notification Service listening...");
  channel.consume("messages",msg=>{
    const message=JSON.parse(msg.content.toString());
    if(message.text.toLowerCase().includes("urgent")){
      console.log("ALERT:",message);
      socket.emit("alert",message);
    }
    channel.ack(msg);
  });
})();
