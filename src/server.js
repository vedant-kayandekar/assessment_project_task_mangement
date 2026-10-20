import express from 'express'
import dotenv from 'dotenv'
dotenv.config()

import app from './app.js'
import { mysqlDB } from './config/mysql.js'
import connectMongoDB from './config/mongodb.js'

const PORT = parseInt(process.env.PORT, 10) || 5000

const start = async () => {
    try{
        console.log('staring databse connection')
        await connectMongoDB()
        await mysqlDB()

        const server = app.listen(PORT,()=>{
            console.log(`Project & Task API running on PORT: [${PORT}]`)
            console.log(`Health Check: http://localhost:${PORT}/health`)  
        })

        
    }catch(err){
        console.error('Failed to start server : ',err.message)
        process.exit(1)
    }
}

start()