const mongoose = require('mongoose')
const transactionModel = require('./transactions.model')
const ledgerSchema = mongoose.Schema({

    account: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "account",
        required: [true, "Account is required to perfrom transaction"],
        index: true,
        immutable: true

    },
    amount: {
        type: Number,
        required: [true, "Account is required to perfrom transaction"],
        immutable: true

    },
    transaction: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Transaction",
        required: [true, "Ledger must be associated with a account"],
        index: true,
        immutable: true
    },
    type: {
        type: String,
        enum: {
            values: ["CREDIT", "DEBIT"]
        },
        required: true,
        immutable: true
    }
})



function preventLedgerModification() {
    throw new error(" Ledger is immutable and can't be modified or deleted")
}

ledgerSchema.pre('findOneAndUpdate', preventLedgerModification)
ledgerSchema.pre('updateOne', preventLedgerModification)
ledgerSchema.pre('deleteOne', preventLedgerModification)
ledgerSchema.pre('remove', preventLedgerModification)
ledgerSchema.pre('deleteMany', preventLedgerModification)
ledgerSchema.pre('fineOneAndDelete', preventLedgerModification)
ledgerSchema.pre('updateMany', preventLedgerModification)
ledgerSchema.pre('fineOneAndReplace', preventLedgerModification)

const ledgerModel = mongoose.model("Ledger", ledgerSchema)

module.exports = ledgerModel