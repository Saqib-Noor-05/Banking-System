const express = require('express')
const app = express();
const cookieParser = require('cookie-parser')
const authRouter = require('./routes/auth.route')
const accountRouter = require('./routes/account.routes')
const transactionRoutes = require('./routes/transaction.routes')

//middlewares

app.use(cookieParser())
app.use(express.json())

app.get("/", (req, res) => {
    res.send("Ledger is up and running")
})
app.use('/api/auth', authRouter)
app.use('/api/account', accountRouter)
app.use('/api/transaction', transactionRoutes)


module.exports = app;