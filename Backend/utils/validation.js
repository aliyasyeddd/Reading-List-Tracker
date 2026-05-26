const validator = require("validator")

const validateSignUpData = (req) => {
    const { name, emailId, password } = req.body
    if (!name) {
        throw new Error("Enter your name")
    } else if (!validator.isEmail(emailId)) {
        throw new Error("Enter a valid email address")
    //checks: { minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1, returnScore: false, pointsPerUnique: 1, pointsPerRepeat: 0.5, pointsForContainingLower: 10, pointsForContainingUpper: 10, pointsForContainingNumber: 10, pointsForContainingSymbol: 10 }
    } else if (!validator.isStrongPassword(password)) {
        throw new Error("Enter a strong password with at least 8 characters, including 1 uppercase, 1 lowercase, 1 number, and 1 symbol")
    }
}

module.exports = {
    validateSignUpData
};
