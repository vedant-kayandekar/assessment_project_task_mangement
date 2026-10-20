
export class projectError extends Error {
    constructor(message,statusCode){
        super(message)
        this.statusCode = statusCode
        this.status = `${statusCode}`.startsWith('4') ? 'fail': 'error'
        this.isOperational = true

        Error.captureStackTrace(this, this.constructor)
    }
}

export const errorHandler = (err,req,res,next) => {

    let statusCode = err.statusCode || 500
    let message = err.message || "enternal sever error"

    if(process.env.NODE_ENV !== 'test'){
        console.error('Error caught by Central Middleware:', {
            name: err.name,
            code: err.code,
            message: err.message
        })
    }

    //mysql related , duplicated entru
    if (err.code === 'ER_DUP_ENTRY') {
        statusCode = 409
        message = 'Email address is already registered.'
    }

    // Mongoose related error of object
    if (err.name === 'CastError') {
        statusCode = 400
        message = `Invalid ID format for parameter: [${err.path}]. Value: "${err.value}"`
    }

    // Mongoose Validation Error
    if (err.name === 'ValidationError') {
        statusCode = 400
        const errors = Object.values(err.errors).map(el => el.message)
        message = `Invalid input data: ${errors.join('. ')}`
    }


    res.status(statusCode).json({sucess:false, message})

}

export default errorHandler