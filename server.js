const express = require('express');
const http =require('http');
const {Server} = require('socket.io');
const mongoose = require('mongoose');
const Document = require("./Document")
const cors= require('cors');
const PORT=process.env.PORT || 3001

require('dotenv').config();
mongoose.connect("mongodb+srv://Ayandutta:6Cxg5eLBpwcc8NrA@cluster0.oraz1lv.mongodb.net/hotelBooking?retryWrites=true&w=majority", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true,
}).then(()=>{
  console.log('connected ')
}).catch(err=>console.log(err));

const app=express();
const server = http.createServer(app);
const io= new Server(server,{
  cors: {
    origin: process.env.BASE_URL,
    methods: ["GET", "POST"],
  },
})

const defaultValue = ""

io.on("connection", socket => {
  socket.on("get-document", async documentId => {
    const document = await findOrCreateDocument(documentId)
    socket.join(documentId)
     document && socket.emit("load-document", document.data)

    socket.on("send-changes", delta => {
      socket.broadcast.to(documentId).emit("receive-changes", delta)
    })

    socket.on("save-document", async data => {
      await Document.findByIdAndUpdate(documentId, { data })
    })
  })
})

async function findOrCreateDocument(id) {
  if (id == null) return

  const document = await Document.findById(id)
  if (document) return document
  return await Document.create({ _id: id, data: defaultValue })
}


server.listen(PORT,()=>{
})
