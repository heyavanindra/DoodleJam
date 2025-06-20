import express, { Request, Response, Router } from "express"

const authRoute :Router = express.Router()


authRoute.post("/", async (req:Request,res:Response) => {
    res.json({
        message:"hello world"
    })
})

export default authRoute