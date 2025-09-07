import React from 'react'
import Chat from '../../../components/Chat'
import axios from 'axios'
import { BACKEND_URL } from '../../config'

async function getRoom(slug:string) {
  try {
    const response = await axios.get(`http://localhost:4000/room/chat-room`)
    if (response.status === 200) {
      return (response).data.roomId
    } else {
      console.error("No response")
    }
  } catch (error) {
    console.error(error)
  }
}

const Page = async ({params}:{ params:{ slug:string } }) => {
  const slug = await params.slug
  const roomId = await getRoom(slug)
  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
      <div className="w-full h-full max-w-3xl rounded-2xl bg-white shadow-xl overflow-hidden">
        <Chat roomId={roomId}></Chat>
      </div>
    </div>
  )
}

export default Page
