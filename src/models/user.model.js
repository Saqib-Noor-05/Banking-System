const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

userSchema = mongoose.Schema({
    email: {
        type: String,
        unique: true,
        lowercase: true,
        required: [true, "Email address is required"],
        trim: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email address"]
    }
    ,
    name: {
        type: String,
        required: [true, "Name is a required field"],
        // unique: true,

    },
    password: {
        type: String,
        required: [true, "Password is required for creating an account"],
        minlength: [6, "Password must be more than 6 characters"],
        select: false,
        /* select: false means this field is EXCLUDED from query results by default.
        It has nothing to do with making the field optional.
        Use required: false to make a field optional. */
    }

}, {
    timestamps: true
})


userSchema.pre("save", async function () {
    if (!this.isModified("password")) {
        return
    }
    const hash = await bcrypt.hash(this.password, 10)
    this.password = hash;
    return
})



userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password)
}



const userModel = mongoose.model("User", userSchema)

module.exports = userModel;