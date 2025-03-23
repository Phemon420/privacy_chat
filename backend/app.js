import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import { Server } from "socket.io"
import dotenv from "dotenv"

dotenv.config()

const app = express()

const PORT = process.env.PORT

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(cors())

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} 🚀`)
})

const io = new Server(server, {
  cors: {
    origin: process.env.ORIGIN,
    methods: ["GET", "POST"]
  }
})

const activeUsers = new Set()

const messages = []

io.on("connection", (socket) => {
  //console.log(`User connected: ${socket.id}`)
  activeUsers.add(socket.id)

  console.log("Active users:", Array.from(activeUsers))
  io.emit("active-users", activeUsers.size)

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`)
    activeUsers.delete(socket.id)
    io.emit("active-users", activeUsers.size)
    console.log("Active users:", Array.from(activeUsers))
  })

  socket.on("sendMessage", (data) => {
    //console.log("Received:", data)
    // Optionally broadcast to others
    io.emit("receiveMessage", data)
  })

  socket.emit("chatHistory", messages)

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id)
  })

})