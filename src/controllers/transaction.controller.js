const transactionModel = require('../models/transactions.model')
const ledgerModel = require('../models/ledger.model')
const emailServicesk = require('../services/email')
const accountModel = require('../models/account.model');
const userModel = require('../models/user.model');
const mongoose = require('mongoose')



async function createTransactionController(req, res) {

    /**
    * 1. Validate request
    */
    const { fromAccount, toAccount, amount, idempotencyKey } = req.body;

    if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
        return res.status(400).json({
            message: "Amount,Idempotencykey, sender and reciever account is required"
        })
    }

    const fromAcc = await accountModel.findOne({
        _id: fromAccount
    })

    const toAcc = await accountModel.findOne({
        _id: toAccount
    })

    if (!fromAcc || !toAcc) {
        return res.status(403).json({
            message: "Sender or reciever account does not exist"
        })

    }
    /**
     * 2. Validate idempotency key
     */

    const isTransactionAlreadyExist = await transactionModel.findOne({
        idempotencyKey: idempotencyKey
    })

    if (isTransactionAlreadyExist) {
        if (isTransactionAlreadyExist.status === "Pending") {
            res.status(200).json({
                message: "Transaction is pending, please retry"
            })
        }
        if (isTransactionAlreadyExist.status === "Complete") {
            res.status(200).json({
                message: "Transaction Completed"
            })
        }
        if (isTransactionAlreadyExist.status === "Failed") {
            res.status(500).json({
                message: "Transaction failed"
            })
        }

        if (isTransactionAlreadyExist.status === "Rollback") {
            res.status(500).json({
                message: "Transaction not done , Keep patience your amount will be credit soon"
            })
        }
    }

    /**
     * 3. Check account status
     */

    if (fromAcc.status !== "ACTIVE" && toAcc.status !== "ACTIVE") {
        res.status(400).json({
            message: "Both sender and reciever must be active to process transaction"
        })
    }


    /**
     * 4. Derive sender balance from Ledger
     */

    const balance = await fromAccount.getBalance()
    if (balance < amount) {
        res.status(400).json({
            message: `Insufficient Balance in ${fromAccount}. Balance to be tranferred is: ${amount}
            Current balance is ${balance}}`
        })
    }

    /**
     * 5. Create transaction (PENDING)
     */

    const session = await mongoose.startSession()
    session.startTransaction()

    const transaction = await transactionModel.create({
        fromAccount,
        toAccount,
        amount,
        idempotencyKey
    },
        { session }
    )




    /**
     * 7.Create DEBIT ledger entry
     */


    const debitLedgerEntry = await ledgerModel.create({
        acount: fromAccount,
        amount,
        transaction: transaction._id,
        type: "DEBIT"

    },
        { session }
    )

    /**
     * 8.Create CREDIT ledger entr
     */

    const creditLedgerEntry = await ledgerModel.create({
        acount: toAccount,
        amount,
        transaction: transaction._id,
        type: "CREDIT"

    },
        { session }
    )


    /**
     *  8. Mark transaction COMPLETED
     */

    transaction.status == "Completed"
    await transaction.save({ session })

    /**
     *  9. Commit MongoDB session
     */
    await session.commitTransaction()
    session.endSession()

    /**
     *  10. Send email notification
     */


    await emailServices.sendTransactionMail(req.user.email, req.user.name, req.user.amount, toAccount._id)

    res.status(200).json({
        message: "Transaction Completed Successfully",
        transaction: transaction
    })


}

async function createInitialFundsTransfer(req, res) {

    try {
        const { toAccount, amount, idempotencyKey } = req.body
        if (!toAccount || !amount || !idempotencyKey) {
            res.status(401).json({
                message: "toAccount,amount,idempotencyKey is required to do funds transfer"
            })
        }
        console.log("To account is : ", toAccount)
        const toUserAccount = await accountModel.findOne({
            _id: toAccount  //kese find krega yrrr.
        })
        console.log(toUserAccount)
        if (!toUserAccount) {
            res.status(401).json({
                message: "The Account does not belong to system user"
            })
        }

        const fromUserAccount = await accountModel.create({
            systemUser: true,
            user: req.user._id
        })
        if (!fromUserAccount) {
            res.status(401).json({
                message: "The User Account does not exist"
            })
        }

        const transaction = new transactionModel({
            fromAccount: fromUserAccount._id,
            toAccount,
            amount,
            idempotencyKey,
            status: "Pending"
        })

        const session = await mongoose.startSession()
        session.startTransaction()

        const debitLedgerEntry = await ledgerModel.create([{
            account: fromUserAccount._id,
            amount: amount,
            transaction,
            type: "DEBIT",
        }],
            { session }
        )

        const creditLedgerEntry = await ledgerModel.create([{
            account: toAccount,
            amount: amount,
            transaction,
            type: "CREDIT",
        }],
            { session }
        )

        transaction.status = "Complete"
        await transaction.save({ session })
        await session.commitTransaction()
        session.endSession()

        return res.status(200).json({
            message: "Initial Fund  transaction completely successfully",
            transaction: transaction
        })

    }


    catch (err) {
        console.error("FULL ERROR:", err)
        console.error("Error code:", err.code)
        console.error("Error codeName:", err.codeName)
        console.error("Error labels:", err.errorLabels)
        await session.abortTransaction()
        session.endSession()
        return res.status(500).json({ message: "Transaction failed", error: err.message })
    }

}



module.exports = {
    createTransactionController,
    createInitialFundsTransfer
}







/**
 * * - Create a new transaction
 * THE 10 STEP TRANSFER FLOW:
    * 1. Validate request
    * 2. Validate idempotency key
    * 3. Check account status
    * 4. Derive sender balance from Ledger
    * 5. Create transaction (PENDING)
    * 6. Create DEBIT ledger entry
    * 7. Create CREDIT ledger entry
    * 8. Mark transaction COMPLETED
    * 9. Commit MongoDB session
    * 10. Send email notification
 */
