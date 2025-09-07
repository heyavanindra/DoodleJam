"use client"

import axios from 'axios'
import React, { useState } from 'react'
import { BACKEND_URL } from '../config'
import { useRouter } from 'next/navigation'
import Cookie from "js-cookie"

const Login = () => {
  const [username, setusername] = useState("")
  const [password, setPassword] = useState("")
  const router = useRouter()

  const handleClick = async () => {
    try {
      const response = await axios.post(`${BACKEND_URL}/auth/login`, {
        username,
        password
      })
      if (response.status === 200) {
        Cookie.set("token", response.data.token)
        router.push("/")
      } else {
        console.log("Wrong ID password")
      }
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="h-screen w-full flex justify-center items-center bg-neutral-900 text-white">
      <div className="flex flex-col gap-4 w-80 p-6 rounded-2xl bg-gray-800 shadow-lg">
        <h2 className="text-2xl font-semibold text-center">Login</h2>
        <input
          type="text"
          placeholder="Username"
          className="px-3 py-2 rounded-lg bg-neutral-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          onChange={(e) => setusername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="px-3 py-2 rounded-lg bg-neutral-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          onClick={handleClick}
          className="py-2 rounded-lg bg-blue-900 cursor-pointer hover:bg-blue-500 transition font-medium"
        >
          Login
        </button>
      </div>
    </div>
  )
}

export default Login
