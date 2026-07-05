const userModel = require('../models/user.model')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const emailServices = require('../services/email')
const tokenBLModel = require('../models/blacklist.model')

async function userRegisterController(req, res) {
    const { email, name, password } = req.body;
    const isExist = await userModel.findOne({
        $or: [
            { email },
            { name }
        ]
    })
    if (isExist) {

        return res.status(422).json({
            message: "User already exist with email or name",
            status: "failed"
        })
    }

    const user = await userModel.create({
        email, password, name
    })

    const token = jwt.sign({
        id: user._id
    }, process.env.JWT_SECRET,
        { expiresIn: "3d" }
    )

    res.cookie("token", token)
    res.status(201).json({
        message: "User Registered Successfully",
        user: {
            _id: user._id,
            email: user.email,
            name: user.name
        }
    })
    await emailServices.sendRegistrationEmail(user.email, user.name)

}


async function loginUser(req, res) {
    const { email, name, password } = req.body;
    const user = await userModel.findOne({
        $or: [
            { name },
            { email }
        ]
    })
        .select("+password")

    if (!user) {
        return res.status(403).json({
            message: "Name or email is Invalid"
        })
    }
    const isValidpassword = await user.comparePassword(password)
    if (!isValidpassword) {
        return res.status(400).json({
            message: "Password Changed recently"
        })
    }

    const token = jwt.sign({
        id: user._id,

    }, process.env.JWT_SECRET)

    res.cookie("token", token)

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    res.status(200).json({
        message: "Login Successfully",
        user: {
            id: user.id,
            name: user.name,
            email: user.name
        }
    })
}

async function logoutUser(req, res) {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1]
    if (!token) {
        return res.status(200).json({
            message: "User logged out successfully"
        })
    }
    res.clearCookie("token")
    // res.cookie.clear("token", "")
    await tokenBLModel.create({
        token: token
    })

    res.status(200).json({
        message: "User logged out successfully"
    })
}


module.exports = { userRegisterController, loginUser, logoutUser }