const { Router } = require('express')
const authMiddleware = require('../middlewares/auth.middleware');
const transactionController = require('../controllers/transaction.controller')

const transactionRoutes = Router()

transactionRoutes.post("/", authMiddleware.authMiddlewares, transactionController.createTransactionController)
transactionRoutes.post("/system/initial-funds", authMiddleware.authSystemUserMiddleware, transactionController.createInitialFundsTransfer)


module.exports = transactionRoutes