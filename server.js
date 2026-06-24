const app = require('./src/app')
const connectDB = require('./src/config/db/db')
require('dotenv').config()

connectDB();

app.listen(3001, () => {
    console.log("Server is running on port 3001")
})

