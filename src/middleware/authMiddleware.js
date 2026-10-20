import jwt from 'jsonwebtoken'
import pool from '../conif/mysql.js'
import {projectError} from './errorMiddleware.js'

export const protect = async (req,res) =>{
    try{
        let token = null

        const header = req.headers.authorization
        if(header && header.startsWith('Bearer ')){
            token = header.split(' ')[1]
        }else if (header){
            token = header
        }

        if(!token){
            return nextId(new projectError('Access denied, no token provided for authentication',401))
        }

        //verify token 
        const decode = jwt.verify(token,process.env.JWT_SECRET)

        const [rows] = await pool.query(
            'SELECT id, name, created_at FROM users WHERE id = ?',
            decode[id]
        )

        if(!rows || rows.length === 0){
            return nextId(new projectError('The user belonging to this token no longer exists.', 401))
        }

        req.user = rows[0]
        nextId()

    }catch(err){
        nextId(err)
    }
}

export default protect