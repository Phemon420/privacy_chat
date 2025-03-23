"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import { Send } from "lucide-react"
import { io } from "socket.io-client"

const URL=process.env.NEXT_PUBLIC_URL;
//const URL="http://localhost:4000";
export default function ChatPage() {
  const [gfg, setGfg] = useState(0)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [username, setUsername] = useState("")
  const [isSettingUsername, setIsSettingUsername] = useState(true)
  const scrollAreaRef = useRef(null)
  const { toast } = useToast()
  const [socket, setSocket] = useState(null)

useEffect(() => {
  const socket = io(URL) // or your backend URL
  setSocket(socket)

  socket.on("connect", () => {
    console.log("Connected")
  })

  socket.on("active-users", (count) => {
    console.log("Total active users:", count)
    //gfg=count;
    setGfg(count)
  })

  // ✅ Receive all previous messages on first connect
  socket.on("chatHistory", (history) => {
    setMessages(history)
  })

  // ✅ Listen for real-time new messages
  socket.on("receiveMessage", (msg) => {
    setMessages(prev => [...prev, msg])
  })

  return () => {
    socket.disconnect()
  }
}, [])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const handleSendMessage = (e) => {
    e.preventDefault()

    if (!input.trim()) return

    // In a real app, you would send this to your API
    const newMessage = {
      id: Date.now().toString(),
      username,
      content: input,
      timestamp: new Date(),
    }
    console.log(newMessage)
    socket.emit("sendMessage", newMessage)

    //setMessages([...messages, newMessage])
    setInput("")

  }

  const handleSetUsername = (e) => {
    e.preventDefault()

    if (!username.trim()) return

    setIsSettingUsername(false)
    toast({
      title: "Welcome to the chat!",
      description: `You've joined as ${username}`,
    })
  }

  if (isSettingUsername) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Join the Chat</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSetUsername} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full"
                />
              </div>
              <Button type="submit" className="w-full">
                Join Chat
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-4xl h-[90vh]">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center justify-between">
            <span>Public Chat Room</span>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Logged in as:</span>
              <span className="font-medium">{username}</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 flex-grow h-[calc(90vh-180px)]">
          <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`mb-4 flex ${message.username === username ? "justify-end" : "justify-start"}`}
              >
                <div className="flex flex-col max-w-[80%]">
                  {message.username !== username && (
                    <div className="text-xs text-muted-foreground mb-1">
                      {message.username} • {new Date(message.timestamp).toLocaleTimeString()}
                    </div>
                  )}
                  <div
                    className={`p-3 rounded-lg ${
                      message.username === username
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground"
                    }`}
                  >
                    {message.content}
                  </div>
                  {message.username === username && (
                    <div className="text-xs text-muted-foreground mt-1 text-right">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </ScrollArea>
        </CardContent>
        <CardFooter className="border-t p-4">
          <form onSubmit={handleSendMessage} className="flex w-full space-x-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-grow"
            />
            <Button type="submit">Send<Send className="w-4 h-4 ml-2" /></Button>
          </form>
        </CardFooter>
      </Card>
      <h3 id="clients-total" className="flex">total guyms online: {gfg}</h3>
    </div>
  )
}