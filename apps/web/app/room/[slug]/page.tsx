import React from 'react'
import Chat from '../../../components/Chat'
import axios from 'axios'
import { BACKEND_URL } from '../../config'

async function getRoom(slug:string) {
  
  try {
    const response = await axios.get(`http://localhost:4000/room/chat-room`)
    if (response.status === 200) {
      return (response).data.roomId
    }else {
      console.error("No response")
    }
  } catch (error) {
    console.error(error)
  }
}

const Page = async ({params}:{
    params:{
        slug:string
    }
}) => {
  const slug = await params.slug
  const roomId = await  getRoom(slug)
  return (
    <div>
      <Chat roomId={roomId}></Chat>
    </div>
  )
}

export default Page