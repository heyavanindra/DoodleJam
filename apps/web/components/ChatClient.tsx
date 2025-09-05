"use client"

import React, { useEffect, useState } from 'react'
import { useSocket } from '../hooks/useSocket'

const ChatClient = ({messages,id}:{
    messages:{message:string}[],
    id:string
}) => {
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
        return <div>Loading...</div>
    }
  return (
    <div>
        {messages.map((m,idx)=>(
            <div key={idx}>{m.message}</div>
        ))}
        {chats.map((chat,idx)=> (<div key={`${idx}+${chat.message}`}>
            {chat.message}
        </div>))}
        <input type="text" onChange={(e)=>{
            setCurrentMessage(e.target.value) 
        }} />
        <button onClick={()=>{
            socket?.send(JSON.stringify({
                type:"chat",
                roomId:id,
                message:currentMessage
            }))
            setCurrentMessage(" ")
        }}>Send</button>
    </div>
  )
}

export default ChatClient