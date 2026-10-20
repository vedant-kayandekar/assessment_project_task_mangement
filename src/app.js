import express from 'express'
import errorHandler from './middleware/errorMiddleware.js'
import authRoutes from './routes/authRoutes.js'
import projectRoutes from './routes/projectRoutes.js'
import taskRoutes from './routes/taskRoutes.js'

const app = express()

app.use(express.json())

app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Project & Task Management API is healthy.',
        timestamp: new Date().toISOString()
    })
})

// ROUTES
app.use('/api/auth', authRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/tasks', taskRoutes)

// error handler must be last
app.use(errorHandler)

export default app
