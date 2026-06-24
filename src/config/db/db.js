const mongoose = require('mongoose')

async function connectDB() {
    await mongoose.connect(process.env.MONGO_URI)
        .then(() => {
            console.log("Connected to DB")
        })
        .catch((err) => {
            console.log("Database Connection Error", err)
            process.exit(1)
        })
}

module.exports = connectDB