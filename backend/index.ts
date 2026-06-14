import express from "express" 
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"

import { signupSchema,loginSchema } from "./schema" 
import { pool } from "./connection" 

dotenv.config() 
const app = express() 
app.use(express.json()) 

app.post("/signup" , async (req,res) => {
    const { data ,success } = signupSchema.safeParse(req.body) 
    if(!success) {
        res.status(403).json({
            message : "incorrect input"
        })
        return 
    }
    const hashedPassword = await bcrypt.hash(data.password,10) ; 
    const query = 'INSERT INTO users (username , email , password) VALUES ($1 ,$2,$3) returning user_id;'
    const response = await pool.query(query , [data.username , data.email , hashedPassword]) 
    res.json({
        message : "signup done" , 
        id : response.rows[0].user_id
    })
})

app.post("/login" , async (req , res) => {
    const { data , success} = loginSchema.safeParse(req.body) 
    if(!success) {
        res.status(403).json({
            message : "invalid credentials"
        })
        return 
    }
    const query = 'SELECT * FROM users WHERE username = $1'
    const response = await pool.query(query , [data.username])
    const userExists = response.rows[0] 
    if(!userExists) {
        res.status(403).json({
            message : "incorrect credentials" 
        })
        return 
    }
    else {
        const validPassword = await bcrypt.compare(data.password,userExists.password) 
        if(validPassword){
            const secret = process.env.JWT_SECRET
            if (!secret) {
                res.status(500).json({
                    message: "JWT secret not configured"
                })
                return
            }
            res.json({
                token: jwt.sign({ username: data.username }, secret),
                message: "logged in successfully!"
            })
        }else {
            res.status(403).json({
                message : "incorrect credentials"
            })
        }
    }
})

app.listen(3000, () => {
    console.log("Server started at port 3000")
})