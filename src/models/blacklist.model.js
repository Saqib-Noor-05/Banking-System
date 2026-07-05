const mongoose = require('mongoose')

const tokenBLSchema = mongoose.Schema({
    token: {
        type: String,
        required: [true, "Token is required to be blacklisted"],
        unique: [true, "Token must be unique"]
    },


}, {
    timestamps: true
})

tokenBLSchema.index({ createdAt: 1 }, {
    expireAfterSeconds: 60 * 60 * 24 * 30     //Token expires after 30days
})

tokenBLModel = mongoose.model("BlacklistedToken", tokenBLSchema)

module.exports = tokenBLModel