import Task from '../models/Task.js'
import pool from '../config/mysql.js'
import { projectError } from '../middleware/errorMiddleware.js'

// add new task
export const createTask = async (req, res, next) => {
    try {
        const { projectId, title, description, status, priority, dueDate } = req.body
        const userId = req.user.id

        if (!projectId || !title) {
            return next(new projectError('projectId and title are required', 400))
        }

        // check if project belongs to this user in mysql
        const [proj] = await pool.query(
            'SELECT id FROM projects WHERE id = ? AND user_id = ?',
            [projectId, userId]
        )

        if (proj.length === 0) {
            return next(new projectError('Project not found or not owned by you', 404))
        }

        const task = await Task.create({
            userId,
            projectId,
            title,
            description: description || '',
            status: status || 'todo',
            priority: priority || 'medium',
            dueDate: dueDate || null
        })

        res.status(201).json({
            success: true,
            data: { task }
        })
    } catch (err) {
        next(err)
    }
}

// get tasks with filter and pagination
export const getTasks = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 10
        const skip = (page - 1) * limit

        let q = { userId: req.user.id }

        // filters
        if (req.query.status) {
            q.status = req.query.status
        }
        if (req.query.priority) {
            q.priority = req.query.priority
        }
        if (req.query.projectId) {
            q.projectId = req.query.projectId
        }

        const tasks = await Task.find(q)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)

        const totalRecords = await Task.countDocuments(q)

        res.status(200).json({
            success: true,
            pagination: {
                totalRecords,
                totalPages: Math.ceil(totalRecords / limit) || 1,
                page,
                limit
            },
            data: { tasks }
        })
    } catch (err) {
        next(err)
    }
}

// get single task
export const getTaskById = async (req, res, next) => {
    try {
        const task = await Task.findOne({ _id: req.params.id, userId: req.user.id })
        if (!task) {
            return next(new projectError('Task not found', 404))
        }

        res.status(200).json({
            success: true,
            data: { task }
        })
    } catch (err) {
        next(err)
    }
}

// update task
export const updateTask = async (req, res, next) => {
    try {
        const updated = await Task.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            req.body,
            { new: true, runValidators: true }
        )

        if (!updated) {
            return next(new projectError('Task not found', 404))
        }

        res.status(200).json({
            success: true,
            message: 'Task updated',
            data: { task: updated }
        })
    } catch (err) {
        next(err)
    }
}

// delete task
export const deleteTask = async (req, res, next) => {
    try {
        const del = await Task.findOneAndDelete({
            _id: req.params.id,
            userId: req.user.id
        })

        if (!del) {
            return next(new projectError('Task not found', 404))
        }

        res.status(200).json({
            success: true,
            message: 'Task deleted'
        })
    } catch (err) {
        next(err)
    }
}
