import jwt from 'jsonwebtoken'

const generateToken = (id, res) =>{
    const token = jwt.sign({id}, process.env.JWT_SEC,{
        expiresIn : "15d",
    });
    
    // Determine if running in production
    const isProduction = process.env.NODE_ENV === 'production';
    
    res.cookie("token", token, {
        maxAge: 15*24*60*1000,
        httpOnly: true,
        secure: isProduction, // true for HTTPS in production, false for localhost
        sameSite: isProduction ? "none" : "strict", // "none" required for cross-domain in production
    });
};

export default generateToken;