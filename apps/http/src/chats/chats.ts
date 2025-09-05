import { prisma } from '@repo/db'
import express, { Request, Response, Router } from 'express'

const chatRoute :Router = express.Router()

chatRoute.get("/:roomId",async (req:Request,res:Response) => {
    const roomId = req.params.roomId

    try {
       const chats = await  prisma.chat.findMany({
            where:{
                roomId:Number(roomId)
            }
        })
        console.log(chats)
        res.status(200).json({
            message:chats
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({
            message:"error while finding the chats",
        })
    }
})

export default chatRoute