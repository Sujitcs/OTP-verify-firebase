const jwt=require('jsonwebtoken');
require('dotenv').config();
const auth=(req,res,next)=>{
    const authHeader = req.headers.authorization;
    //console.log(authHeader);
    const token = authHeader && authHeader.split(" ")[1];
    //console.log(token);
    if(!token)
        {
            return res.status(400).json({"message":"No token"}) 
            //console.log(token) 
        }
        try {
            const decoded = jwt.verify(token, process.env.SECRET_KEY);
            req.user = decoded;
            next();
            // console.log('i am here')
        } catch (error) {
            res.status(401).json({ msg: 'token is invalid' });
        }
}
module.exports=auth;
