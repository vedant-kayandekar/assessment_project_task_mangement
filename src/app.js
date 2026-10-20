import express from 'express'
import errorHandler from './middleware/errorMiddleware.js'


const app = express()
const PORT = 3333

app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Project & Task Management API is healthy .',
        timestamp: new Date().toISOString()
    })
})


app.use(errorHandler)
export default app


