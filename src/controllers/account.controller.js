const accountModel = require('../models/account.model')
const userModel = require('../models/user.model')


async function createAccountController(req, res) {
    const user = req.user
    const account = await accountModel.create({
        user: user.id,
        currency: req.body.currency,
        status: req.body.status
    })

    res.status(201).json({
        account
    })
}

async function getUserAccountsController(req, res) {
    const accounts = await accountModel.find({
        user: req.user._id
    })
    res.status(200).json({
        accounts
    })
}


async function getBalanceController(req, res) {
    const { accountID } = req.params;
    const account = await accountModel.findOne({
        _id: accountID,
        // user: req.user._id
    })
    if (!account) {
        return res.status(404).json({
            message: "Account not found"
        })
    }
    const balance = await account.getBalance()
    res.status(200).json({
        message: "User balance is : ",
        balance: balance
    })

}

module.exports = {
    createAccountController,
    getUserAccountsController,
    getBalanceController
}