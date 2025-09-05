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

    const handleClick = async ()=> {
        
        try {
            const response = await axios.post(`http://localhost:4000/auth/login`,{
                username,
                password
            })
            if (response.status === 200) {
                console.log(response.data)
                Cookie.set("token",response.data.token)
                router.push("/")
            }else {
                console.log("Wrong ID password")
            }

        } catch (error) {
            console.error(error)
        }
    }
  return (
    <div>
        <input type="text" placeholder='username' onChange={(e)=>{
            setusername(e.target.value)
        }} />
        <input type="text" placeholder='password' onChange={(e)=>{
setPassword(e.target.value)
        }} />
        <button onClick={handleClick}>LOGIN</button>
    </div>
  )
}

export default Login