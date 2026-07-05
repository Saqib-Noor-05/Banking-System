const transactionModel = require('../models/transactions.model')
const ledgerModel = require('../models/ledger.model')
const emailServices = require('../services/email')
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

    try {

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
                return res.status(200).json({
                    message: "Transaction is pending, please retry"
                })
            }
            if (isTransactionAlreadyExist.status === "Complete") {
                return res.status(200).json({
                    message: "Transaction Completed"
                })
            }
            if (isTransactionAlreadyExist.status === "Failed") {
                return res.status(500).json({
                    message: "Transaction failed"
                })
            }

            if (isTransactionAlreadyExist.status === "Rollback") {
                return res.status(500).json({
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

        const balance = await fromAcc.getBalance()
        if (balance < amount) {
            return res.status(400).json({
                message: `Insufficient Balance in ${fromAcc}. Balance to be tranferred is: ${amount}
            Current balance is ${balance}}`
            })
        }



        /**
         * 5. Create transaction (PENDING)
         */

        let transaction;

        try {
            const session = await mongoose.startSession()
            session.startTransaction()

            transaction = (await transactionModel.create([{
                fromAccount: fromAcc,
                toAccount: toAcc,
                amount,
                idempotencyKey
            }],
                { session }
            ))[0]



            /**
             * 6.Create DEBIT ledger entry
             */


            const debitLedgerEntry = await ledgerModel.create([{
                account: fromAcc,
                amount: amount,
                transaction: transaction._id,
                type: "DEBIT"

            }],
                { session }
            )

            await new Promise((resolve) => {
                setTimeout(resolve, 3 * 1000);
            });

            // await (() => {
            //     return new Promise((resolve) => setTimeOut(resolve, 100 * 1000))
            // })()

            /**
             * 7.Create CREDIT ledger entr
             */

            const creditLedgerEntry = await ledgerModel.create([{
                account: toAcc,
                amount: amount,
                transaction: transaction._id,
                type: "CREDIT"

            }],
                { session }
            )


            /**
             *  8. Mark transaction COMPLETED
             */

            await transactionModel.findOneAndUpdate(
                { _id: transaction._id },
                { status: "Completed" },
                { session }

            )

            transaction.status = "Completed"
            // await transaction.save({ session })

            /**
             *  9. Commit MongoDB session
             */
            await session.commitTransaction()
            session.endSession()
        }
        catch (err) {
            return res.status(400).json({
                messgae: "Transacton failed due to error"

            })
        }
        /**
         *  10. Send email notification
         */


        await emailServices.sendTransactionMail(req.user.email, req.user.name, amount, toAcc._id)

        res.status(200).json({
            message: "Transaction Completed Successfully",
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



async function createInitialFundsTransfer(req, res) {

    try {
        const { toAccount, amount, idempotencyKey } = req.body
        if (!toAccount || !amount || !idempotencyKey) {
            res.status(401).json({
                message: "toAccount,amount,idempotencyKey is required to do funds transfer"
            })
        }

        const toUserAccount = await accountModel.findOne({
            _id: toAccount  //kese find krega yrrr. bcoz in api we r passing id for sender and reciever
        })

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

        transaction.status = "Completed"
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
