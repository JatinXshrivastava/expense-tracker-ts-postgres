import express from "express"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!
});

const prisma = new PrismaClient({
    adapter
});

import { signupSchema, loginSchema, incomeSchema } from "./schema"
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
    const createUser = await prisma.users.create({
        data: {
            username: data.username,
            password: hashedPassword,
            email: data.email
        },
    })
    res.json({
        message: "signup done",
        id: createUser.user_id
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
    const userExists = await prisma.users.findFirst({
        where: {
            username: data.username
        }
    })
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
    const userResult = await prisma.users.findFirst({
        where: {
            username: username 
        },
        select: {
            user_id : true
        }
    })
    if (!userResult) {
        return res.status(404).json({
            message: "User not found"
        });
    }

    const user_ID : number = userResult.user_id;
    await prisma.transactions.create({
        data: {
            transaction_type : "income" , 
            amount : data.amount , 
            category : data.category , 
            date : data.date , 
            remarks : data.remarks , 
            user_id : user_ID
        }
    })
    res.json({
        message: "transaction added successfully !"
    })
})

app.post("/transaction/expense", authMiddleware, async (req, res) => {
    const username: string = req.body.username
    const {data , success} = incomeSchema.safeParse(req.body)
    if (!success) {
        res.status(403).json({
            message: "enter valid credentials",
        })
        return
    }
    const userResult = await prisma.users.findFirst({
        where: {
            username: username 
        },
        select: {
            user_id : true
        }
    })
    if (!userResult) {
        return res.status(404).json({
            message: "User not found"
        });
    }

    const user_ID = userResult.user_id;
    await prisma.transactions.create({
        data: {
            transaction_type : "expense" , 
            amount : data.amount , 
            category : data.category , 
            date : data.date , 
            remarks : data.remarks , 
            user_id : user_ID
        }
    })
    res.json({
        message: "transaction added successfully !"
    })
})
app.get("/transaction", async (req, res) => {
    const username: string = req.body.username
    const userResult = await prisma.users.findFirst({
        where: {
            username: username 
        },
        select: {
            user_id : true
        }
    })
    if (!userResult) {
        return res.status(404).json({
            message: "User not found"
        });
    }
    const user_ID = userResult.user_id;
    const response = await prisma.transactions.findMany({
        where: {
            user_id : user_ID 
        }
    })
    res.json({
        transactions: response
    })
})

app.listen(3000, () => {
    console.log("Server started at port 3000")
})