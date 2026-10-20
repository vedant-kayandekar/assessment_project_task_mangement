import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import pool from '../config/mysql.js'
import {projectError} from '../middleware/errorMiddleware.js'


const generateToken = (userId) => {
    return jwt.sign(
        {id: userId},
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h'}
    )
}


export const register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body

        // input validation
        if (!name || !email || !password) {
            return next(new projectError('Please provide name, email, and password.', 400))
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            return next(new projectError('Please provide a valid email address.', 400))
        }

        if (password.length < 6) {
            return next(new projectError('Password must be at least 6 characters long.', 400))
        }

        // check for duplicate email
        const [existingUsers] = await pool.query(
            'SELECT id FROM users WHERE email = ?',
            [email.toLowerCase().trim()]
        )

        if (existingUsers.length > 0) {
            return next(new projectError('Email address already exists.', 409))
        }

        // hashing
        const salt = await bcrypt.genSalt(12)
        const hashedPassword = await bcrypt.hash(password, salt)

        // insert new user in mYsql
        const [result] = await pool.query(
            'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
            [name.trim(), email.toLowerCase().trim(), hashedPassword]
        )

        const userId = result.insertId
        const token = generateToken(userId)

        // 
        res.status(201).json({
            success: true,
            message: 'User account created successfully.',
            data: {
                token,
                user: {
                    id: userId,
                    name: name.trim(),
                    email: email.toLowerCase().trim()
                }
            }
        })
    } catch (err) {
        next(err)
    }
}

export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body

        // Validation
        if (!email || !password) {
            return next(new AppError('Please provide both email and password.', 400))
        }

        // Fetch user from MySQL by email
        const [users] = await pool.query(
            'SELECT * FROM users WHERE email = ?',
            [email.toLowerCase().trim()]
        )

        if (users.length === 0) {
            //  error message 
            return next(new AppError('Invalid email or password.', 401))
        }

        const user = users[0]

        // compare password using bcrypt
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return next(new AppError('Invalid email or password.', 401))
        }

        // generate JWT
        const token = generateToken(user.id)

        res.status(200).json({
            success: true,
            message: 'User logged in successfully.',
            data: {
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email
                }
            }
        })
    } catch (err) {
        next(err)
    }
}



export const getMe = async (req, res, next) => {
    try {
        // req.user was securely populated by authMiddleware
        res.status(200).json({
            success: true,
            data: {
                user: req.user
            }
        })
    } catch (err) {
        next(err)
    }
}

export const updateProfile = async (req, res, next) => {
    try {
        const { name, email } = req.body
        const userId = req.user.id

        if (!name && !email) {
            return next(new AppError('Please provide at least one field to update (name or email).', 400))
        }

        const currentName = name ? name.trim() : req.user.name
        let currentEmail = req.user.email

        if (email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            if (!emailRegex.test(email)) {
                return next(new AppError('Please provide a valid email address.', 400))
            }

            const cleanEmail = email.toLowerCase().trim()

            // If changing email, ensure new email is not taken by another user
            if (cleanEmail !== req.user.email) {
                const [conflict] = await pool.query(
                    'SELECT id FROM users WHERE email = ? AND id != ?',
                    [cleanEmail, userId]
                )
                if (conflict.length > 0) {
                    return next(new AppError('This email is already in use by another account.', 409))
                }
                currentEmail = cleanEmail
            }
        }

        // Update user in MySQL
        await pool.query(
            'UPDATE users SET name = ?, email = ? WHERE id = ?',
            [currentName, currentEmail, userId]
        )

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully.',
            data: {
                user: {
                    id: userId,
                    name: currentName,
                    email: currentEmail
                }
            }
        })
    } catch (err) {
        next(err)
    }
}
