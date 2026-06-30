const express = require('express')
const app = express();
const cookieParser = require('cookie-parser')
const authRouter = require('./routes/auth.route')
const accountRouter = require('./routes/account.routes')
const transactionRoutes = require('./routes/transaction.routes')

//middlewares
app.use(cookieParser())
app.use(express.json())
app.use('/api/auth', authRouter)
app.use('/api/transaction', transactionRoutes)
app.use('/api/account', accountRouter)


module.exports = app;