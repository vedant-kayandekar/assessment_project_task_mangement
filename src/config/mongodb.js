import mongoose from 'mongoose'


export const connectMongoDB = async () => {
    try {
        const mongoURL = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/assessment'

        const conn = await mongoose.connect(mongoURL)
        console.log(`Mongodb connected`)

        mongoose.connection.on('error',(err) => {
            console.error(err.message)
        })

    } catch (error) {
        console.error('MongoDB Connection Error:', error.message)
        throw error
    }
}

export default connectMongoDB