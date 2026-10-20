import mysql from 'mysql/promise'


const pool = mysql.createPool({
    host: process.env.MYSQL_HOST || 'localhost',
    port: parseInt(process.env.MYSQL_PORT, 10) || 3306,
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'choira_assessment_db',
    waitForConnections: true,
    connectionLimit: 10,     // Max connections
    queueLimit: 0            // unlimited queue 
})


export const initMySQL = async () => {
    try {
        const serverConnection = await mysql.createConnection({
            host: process.env.MYSQL_HOST || 'localhost',
            port: parseInt(process.env.MYSQL_PORT, 10) || 3306,
            user: process.env.MYSQL_USER || 'root',
            password: process.env.MYSQL_PASSWORD || ''
        })

        const dbName = process.env.MYSQL_DATABASE || 'assessment'
        await serverConnection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`)
        await serverConnection.end()

        const connection = await pool.getConnection()
        console.log(`MySQL Connected to [${dbName}]`)

        await connection.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(191) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_user_email (email)
            ) ENGINE=InnoDB;
        `)

        await connection.query(`
            CREATE TABLE IF NOT EXISTS projects (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                name VARCHAR(255) NOT NULL,
                description TEXT NULL,
                status ENUM('active', 'completed', 'archived') NOT NULL DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                CONSTRAINT fk_projects_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                INDEX idx_projects_user_id (user_id),
                INDEX idx_projects_status (status)
            ) ENGINE=InnoDB;
        `)

        connection.release()
        console.log('MySQL Tables (users, projects) initialized and ready.')
    } catch (error) {
        console.error('MySQL Initialization Error:', error.message)
        throw error
    }
}

export default pool
