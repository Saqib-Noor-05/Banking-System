const express = require('express')
const authMiddleware = require('../middlewares/auth.middleware');
const accountContoller = require('../controllers/account.controller');
const router = express.Router();

router.post("/create-account", authMiddleware.authMiddlewares, accountContoller.createAccountController)
router.get("/getAllAccounts", authMiddleware.authMiddlewares, accountContoller.getUserAccountsController)
module.exports = router