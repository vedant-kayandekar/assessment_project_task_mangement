import mongoose from 'mongoose'


const taskSchema = new mongoose.Schema({
    userId: {
        type: Number,
        required: [true, 'Task must belong to a user'],
        index: true
    },
    projectId: {
        type: Number,
        required: [true, 'Task must belong to a project)'],
        index: true
    },
    title: {
        type: String,
        required: [true, 'title is required'],
        trim: true,
        maxlength: [200, 'cannot exceed 200 characters']
    },
    description: {
        type: String,
        trim: true,
        default: ''
    },
    status: {
        type: String,
        enum: {
            values: ['todo', 'in_progress', 'completed'],
            message: 'Status must be one of: todo, in_progress, completed'
        },
        default: 'todo',
        index: true
    },
    priority: {
        type: String,
        enum: {
            values: ['low', 'medium', 'high'],
            message: 'Priority must be one of: low, medium, high'
        },
        default: 'medium',
        index: true
    },
    dueDate: {
        type: Date,
        default: null
    }
}, {
    timestamps: true // auto timststamp creation
})

// Indexing for fast filtering and pagition
taskSchema.index({ userId: 1, projectId: 1 })
taskSchema.index({ userId: 1, status: 1 })
taskSchema.index({ userId: 1, priority: 1 })
taskSchema.index({ userId: 1, status: 1, priority: 1 })

const Task = mongoose.model('Task', taskSchema)
export default Task