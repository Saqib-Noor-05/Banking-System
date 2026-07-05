const express = require('express')
const authController = require('../controllers/auth.Controller')
const router = express.Router()

router.post('/register', authController.userRegisterController)
router.post('/login', authController.loginUser)
router.post('/logout', authController.logoutUser)



module.exports = router
