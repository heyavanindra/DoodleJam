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


const Chat = async ({roomId}:{
    roomId:string
}) => {

    const messages  = await getChat(roomId)



   
  return (
   <ChatClient messages={messages} id={roomId}></ChatClient>
  )
}

export default Chat