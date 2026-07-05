const mongoose = require('mongoose')
const transactionSchema = mongoose.Schema({
    fromAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: [true, "Trasaction must be associated with a from  account"],
        index: true
    },
    toAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: [true, "Trasaction must be associated with a to account"],
        index: true

    },
    status: {
        type: String,
        enum: {
            values: ["Pending", "Completed", "Failed", "Rollback"],
            message: "Status can be either Complete, Failed, Rollback"
        },
        default: "Pending"
    },
    amount: {
        type: Number,
        required: [true, "Amount is required to perform a transaction"],
        min: [0, "Amount can never be negative"]

    },

    idempotencyKey:
    {
        type: String,
        required: true,
        unique: true,
        index: true
    }
})

const transactionModel = mongoose.model("Transaction", transactionSchema)

module.exports = transactionModel 