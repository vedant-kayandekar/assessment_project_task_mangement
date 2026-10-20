import pool from '../config/mysql.js'
import { projectError } from '../middleware/errorMiddleware.js'

// create new project
export const createProject = async (req, res, next) => {
    try {
        const { name, description, status } = req.body
        const userId = req.user.id

        if (!name) {
            return next(new projectError('Project name is required', 400))
        }

        const projectStatus = status || 'active'
        const [result] = await pool.query(
            'INSERT INTO projects (user_id, name, description, status) VALUES (?, ?, ?, ?)',
            [userId, name.trim(), description || null, projectStatus]
        )

        const [rows] = await pool.query('SELECT * FROM projects WHERE id = ?', [result.insertId])

        res.status(201).json({
            success: true,
            data: { project: rows[0] }
        })
    } catch (err) {
        next(err)
    }
}

// get all projects of logged in user
export const getProjects = async (req, res, next) => {
    try {
        const [projects] = await pool.query(
            'SELECT * FROM projects WHERE user_id = ? ORDER BY created_at DESC',
            [req.user.id]
        )

        res.status(200).json({
            success: true,
            total: projects.length,
            data: { projects }
        })
    } catch (err) {
        next(err)
    }
}

// get single project by id
export const getProjectById = async (req, res, next) => {
    try {
        const [rows] = await pool.query(
            'SELECT * FROM projects WHERE id = ? AND user_id = ?',
            [req.params.id, req.user.id]
        )

        if (rows.length === 0) {
            return next(new projectError('Project not found', 404))
        }

        res.status(200).json({
            success: true,
            data: { project: rows[0] }
        })
    } catch (err) {
        next(err)
    }
}

// update project
export const updateProject = async (req, res, next) => {
    try {
        const { name, description, status } = req.body
        const projectId = req.params.id

        const [existing] = await pool.query(
            'SELECT * FROM projects WHERE id = ? AND user_id = ?',
            [projectId, req.user.id]
        )

        if (existing.length === 0) {
            return next(new projectError('Project not found', 404))
        }

        const current = existing[0]
        const newName = name || current.name
        const newDesc = description !== undefined ? description : current.description
        const newStatus = status || current.status

        await pool.query(
            'UPDATE projects SET name = ?, description = ?, status = ? WHERE id = ? AND user_id = ?',
            [newName, newDesc, newStatus, projectId, req.user.id]
        )

        const [updated] = await pool.query('SELECT * FROM projects WHERE id = ?', [projectId])

        res.status(200).json({
            success: true,
            message: 'Project updated',
            data: { project: updated[0] }
        })
    } catch (err) {
        next(err)
    }
}

// delete project
export const deleteProject = async (req, res, next) => {
    try {
        const [result] = await pool.query(
            'DELETE FROM projects WHERE id = ? AND user_id = ?',
            [req.params.id, req.user.id]
        )

        if (result.affectedRows === 0) {
            return next(new projectError('Project not found', 404))
        }

        res.status(200).json({
            success: true,
            message: 'Project deleted successfully'
        })
    } catch (err) {
        next(err)
    }
}
