import express from "express"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"

import { signupSchema, loginSchema, incomeSchema } from "./schema"
import { pool } from "./connection"
import { authMiddleware } from "./middleware"

dotenv.config()
const app = express()
app.use(express.json())

app.post("/signup", async (req, res) => {
    const { data, success } = signupSchema.safeParse(req.body)
    if (!success) {
        res.status(403).json({
            message: "incorrect input"
        })
        return
    }
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const query = 'INSERT INTO users (username , email , password) VALUES ($1 ,$2,$3) returning user_id;'
    const response = await pool.query(query, [data.username, data.email, hashedPassword])
    res.json({
        message: "signup done",
        id: response.rows[0].user_id
    })
})

app.post("/login", async (req, res) => {
    const { data, success } = loginSchema.safeParse(req.body)
    if (!success) {
        res.status(403).json({
            message: "invalid credentials"
        })
        return
    }
    const query = 'SELECT * FROM users WHERE username = $1'
    const response = await pool.query(query, [data.username])
    const userExists = response.rows[0]
    if (!userExists) {
        res.status(403).json({
            message: "incorrect credentials"
        })
        return
    }
    else {
        const validPassword = await bcrypt.compare(data.password, userExists.password)
        if (validPassword) {
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
        } else {
            res.status(403).json({
                message: "incorrect credentials"
            })
        }
    }
})
app.post("/transaction/income", authMiddleware, async (req, res) => {
    const username: string = req.body.username
    const { data, success } = incomeSchema.safeParse(req.body)
    if (!success) {
        res.status(403).json({
            message: "enter valid credentials"
        })
        return
    }
    const user_query = 'SELECT user_id FROM users WHERE username = $1; '
    const userResult = await pool.query(user_query, [username])
    if (userResult.rows.length === 0) {
        return res.status(404).json({
            message: "User not found"
        });
    }

    const user_ID = userResult.rows[0].user_id;
    const query = 'INSERT INTO transaction (type,user_id,amount,category,date,remarks) VALUES ($1,$2,$3,$4,$5,$6) ;'
    await pool.query(query, ["income", user_ID, data.amount, data.category, data.date, data.remarks])
    res.json({
        message: "transaction added successfully !"
    })
})
app.post("/transaction/expense", authMiddleware, async (req, res) => {
    const username: string = req.body.username
    const result = incomeSchema.safeParse(req.body)
    if (!result.success) {
        res.status(403).json({
            message: "enter valid credentials",
            error: result.error.issues
        })
        return
    }
    const user_query = 'SELECT user_id FROM users WHERE username = $1; '
    const userResult = await pool.query(user_query, [username])
    if (userResult.rows.length === 0) {
        return res.status(404).json({
            message: "User not found"
        });
    }

    const user_ID = userResult.rows[0].user_id;
    const query = 'INSERT INTO transaction (type,user_id,amount,category,date,remarks) VALUES ($1,$2,$3,$4,$5,$6) ;'
    await pool.query(query, ["expense", user_ID, result.data.amount, result.data.category, result.data.date, result.data.remarks])
    res.json({
        message: "transaction added successfully !"
    })
})
app.get("/transaction" , async (req,res) => {
    const username : string = req.body.username 
    const user_query = 'SELECT user_id FROM users WHERE username = $1; '
    const userResult = await pool.query(user_query, [username])
    if (userResult.rows.length === 0) {
        return res.status(404).json({
            message: "User not found"
        });
    }
    const user_ID = userResult.rows[0].user_id;
    const query = 'SELECT * FROM transaction WHERE user_id = $1' 
    const response = await pool.query(query,[user_ID])
    res.json({
        transactions : response.rows 
    })
})
app.listen(3000, () => {
    console.log("Server started at port 3000")
})