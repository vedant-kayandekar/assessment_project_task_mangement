import jwt from 'jsonwebtoken'
import pool from '../config/mysql.js'
import {projectError} from './errorMiddleware.js'

export const protect = async (req,res,next) =>{
    try{
        let token = null

        const header = req.headers.authorization
        if(header && header.startsWith('Bearer ')){
            token = header.split(' ')[1]
        }else if (header){
            token = header
        }

        if(!token){
            return next(new projectError('Access denied, no token provided for authentication',401))
        }

        //verify token 
        const decode = jwt.verify(token,process.env.JWT_SECRET)

        const [rows] = await pool.query(
            'SELECT id, name, email, created_at FROM users WHERE id = ?',
            [decode.id]
        )

        if(!rows || rows.length === 0){
            return next(new projectError('The user belonging to this token no longer exists.', 401))
        }

        req.user = rows[0]
        next()

    }catch(err){
        next(err)
    }
}

export default protect