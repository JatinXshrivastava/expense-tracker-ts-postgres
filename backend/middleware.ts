import jwt from "jsonwebtoken"
import type { JwtPayload } from "jsonwebtoken"
import dotenv from "dotenv"
import type { Request, Response, NextFunction } from "express"
dotenv.config() 

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const token = Array.isArray(req.headers.token) ? req.headers.token[0] : req.headers.token
    if (!token || typeof token !== "string") {
        res.status(403).json({
            message: "youu are not logged in"
        })
        return
    }
    const secret = process.env.JWT_SECRET
    if (!secret) {
        res.status(500).json({
            message: "JWT secret is not configured"
        })
        return
    }

    const decoded = jwt.verify(token, secret) as JwtPayload
    const username = decoded.username 
    if(!username) {
        res.status(403).json({
            message : "token malformed" 
        })
        return 
    }
    req.body.username = username 
    next()
}