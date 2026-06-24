const userModel = require('../models/user.model')
const jwt = require('jsonwebtoken')

async function authMiddlewares(req, res, next) {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1]
    if (!token) {
        return res.status(401).json({ message: "Unauthorised , Token is missing" })
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await userModel.findById(decoded.id)
        req.user = user
        return next()
    }
    catch (err) {
        console.log("Authentication error :", err)
        return res.status(401).json({ message: "Unauthorised , Token mismatched" })

    }

}

module.exports = { authMiddlewares }
