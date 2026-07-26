import jwt from 'jsonwebtoken'
import { User } from '../models/userModel.js'


export const isAuth = async(req, res,next) =>{
    try{
        const token = req.cookies.token;

        if(!token) {
            return res.status(401).json({message:"Token not found. Please login."})
        }

        const decodedData = jwt.verify(token, process.env.JWT_SEC)

        if(!decodedData) {
            return res.status(401).json({
                message:"Invalid token",
            })
        }

        req.user = await User.findById(decodedData.id);
        
        if(!req.user) {
            return res.status(401).json({
                message:"User not found",
            })
        }

        next();
    } catch(error){
        // Handle token expiration
        if(error.name === 'TokenExpiredError') {
            return res.status(401).json({
                message:"Token expired. Please login again"
            })
        }
        
        // Handle invalid token
        if(error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                message:"Invalid token. Please login again"
            })
        }
        
        res.status(401).json({
            message:"Authentication failed. Please login"
        })
    }
}