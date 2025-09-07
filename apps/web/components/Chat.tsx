import axios from 'axios'
import React from 'react'
import { BACKEND_URL } from '../app/config'
import ChatClient from './ChatClient'

async function getChat(roomId:string) {
  try {
    const response = await axios.get(`${BACKEND_URL}/chat/${roomId}`)
    return response.data.message
  } catch (error) {
    console.error(error)
  }
}

const Chat = async ({roomId}:{ roomId:string }) => {
  const messages  = await getChat(roomId)

  return (
    <div className="flex flex-col h-[600px]">
      <div className="flex items-center justify-between px-4 py-2 border-b bg-gray-50">
        <h2 className="text-lg font-semibold text-gray-700">Chat Room</h2>
      </div>
      <ChatClient messages={messages} id={roomId}></ChatClient>
    </div>
  )
}

export default Chat
