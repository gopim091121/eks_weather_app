const express=require("express");
const amqp=require("amqplib");
const app=express();
const port=4000;
let totalMessages=0;
let messagesPerUser={};
const RABBITMQ_URL=process.env.RABBITMQ_URL||"amqp://rabbitmq";

(async()=>{
  const conn=await amqp.connect(RABBITMQ_URL);
  const channel=await conn.createChannel();
  await channel.assertQueue("messages",{durable:true});
  channel.consume("messages",msg=>{
    const {user}=JSON.parse(msg.content.toString());
    totalMessages++;
    messagesPerUser[user]=(messagesPerUser[user]||0)+1;
    channel.ack(msg);
  });
})();

app.get("/metrics",(req,res)=>{
  let output=`# HELP total_messages Total messages\n# TYPE total_messages counter\ntotal_messages ${totalMessages}\n`;
  for(const u in messagesPerUser) output+=`# HELP messages_by_user\n# TYPE messages_by_user counter\nmessages_by_user{user="${u}"} ${messagesPerUser[u]}\n`;
  res.send(output);
});

app.listen(port,()=>console.log("Analytics running on port",port));
