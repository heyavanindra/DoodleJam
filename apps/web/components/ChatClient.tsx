"use client"

import React, { useEffect, useState } from 'react'
import { useSocket } from '../hooks/useSocket'

const ChatClient = ({messages,id}:{ messages:{message:string}[], id:string }) => {
  const {loading,socket} = useSocket()
  const [chats, setChats] = useState(messages)
  const [currentMessage, setCurrentMessage] = useState<string>()

  useEffect(() => {
    if (socket && !loading) {
      socket.send(JSON.stringify({
        type:"join_room",
        roomId:id
      }))
      socket.onmessage = (Event)  =>{
        const parsedData = JSON.parse(Event.data);
        if (parsedData.type === "chat") {
          setChats(c => [...c,{message:parsedData.message}])
        }
      }
    }
  }, [socket,loading,id])

  if (loading) {
    return <div className="flex h-full items-center justify-center text-gray-500">Loading...</div>
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {messages.map((m,idx)=>(
          <div key={idx} className="max-w-xs rounded-lg bg-gray-200 px-3 py-2 text-sm text-gray-800">
            {m.message}
          </div>
        ))}
        {chats.map((chat,idx)=>(
          <div key={`${idx}+${chat.message}`} className="max-w-xs rounded-lg bg-indigo-500 px-3 py-2 text-sm text-white ml-auto">
            {chat.message}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 border-t p-3 bg-white">
        <input 
          type="text" 
          className="flex-1 rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          placeholder="Type your message..."
          onChange={(e)=> setCurrentMessage(e.target.value)} 
          value={currentMessage}
        />
        <button 
          onClick={()=>{
            socket?.send(JSON.stringify({
              type:"chat",
              roomId:id,
              message:currentMessage
            }))
            setCurrentMessage(" ")
          }}
          className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-600 transition"
        >
          Send
        </button>
      </div>
    </div>
  )
}

export default ChatClient
