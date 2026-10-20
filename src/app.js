import express from 'express'


const app = express()
const PORT = 3333

app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Choira Project & Task Management API is healthy and running.',
        timestamp: new Date().toISOString()
    })
})

export default app


