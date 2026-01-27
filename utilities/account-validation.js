const utilities = require(".")
const { body, validationResult } = require("express-validator")
const validate = {}
  
/*  **********************************
  *  Registration Data Validation Rules
  * ********************************* */
validate.registrationRules = () => {
    return [
      // firstname is required and must be string
      body("account_firstname")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 3 })
        .withMessage("Please provide a first name."), // on error this message is sent.
  
      // lastname is required and must be string
      body("account_lastname")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 2 })
        .withMessage("Please provide a last name."), // on error this message is sent.
  
      // valid email is required and cannot already exist in the DB
      body("account_email")
      .trim()
      .escape()
      .notEmpty()
      .isEmail()
      .normalizeEmail() // refer to validator.js docs
      .withMessage("A valid email is required."),
  
      // password is required and must be strong password
      body("account_password")
        .trim()
        .notEmpty()
        .isStrongPassword({
          minLength: 12,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1,
        })
        .withMessage("Password does not meet requirements."),
    ]
  }

  /* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */
validate.checkRegData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email } = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("account/register", {
      errors,
      title: "Registration",
      nav,
      account_firstname,
      account_lastname,
      account_email,
    })
    return
  }
  next()
}
/* ******************************
 * Login Data Validation Rules
 * ***************************** */
validate.loginRules = () => {
  return [
    body("account_email")
      .trim()
      .notEmpty()
      .isEmail()
      .withMessage("A valid email is required.")
      .normalizeEmail(),

    body("account_password")
      .trim()
      .notEmpty()
      .withMessage("Password cannot be empty.")
  ]
}

/* ******************************
 * Check login data and return errors
 * ***************************** */
validate.checkLoginData = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav()

    // Sticky email for login
    res.locals.account_email = req.body.account_email

    return res.render("account/login", {
      title: "Login",
      nav,
      errors,
    })
  }
  next()
}

/* *********************************
 * Account Update Validation Rules
 * ********************************* */
validate.updateAccountRules = () => {
  return [
    body("account_firstname").trim().notEmpty().withMessage("First name is required."),
    body("account_lastname").trim().notEmpty().withMessage("Last name is required."),
    body("account_email").trim().isEmail().withMessage("Valid email is required.")
      .custom(async (email, { req }) => {
        const accountModel = require('../models/account-model')
        const existingAccount = await accountModel.getAccountByEmail(email)
        if (existingAccount && existingAccount.account_id != req.body.account_id) {
          throw new Error("Email already exists.")
        }
      })
  ]
}

/* ******************************
 * Check Account Update Data
 * ***************************** */
validate.checkUpdateAccountData = async (req, res, next) => {
  let errors = validationResult(req)

  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("account/update-account", {
      title: "Update Account",
      nav,
      errors,
      accountData: req.body
    })
    return
  }
  next()
}

/* *********************************
 * Password Validation Rules
 * ********************************* */
validate.passwordRules = () => {
  return [
    body("account_password")
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password does not meet security requirements.")
  ]
}

/* ******************************
 * Check Password Data
 * ***************************** */
validate.checkPasswordData = async (req, res, next) => {
  let errors = validationResult(req)

  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("account/update-account", {
      title: "Update Account",
      nav,
      errors,
      accountData: req.body
    })
    return
  }
  next()
}
 
// Password update rules
validate.updatePasswordRules = () => {
  return [
    body("account_password")
      .isLength({ min: 12 }).withMessage("Password must be at least 12 characters.")
      .matches(/[A-Z]/).withMessage("Password must contain a capital letter.")
      .matches(/[0-9]/).withMessage("Password must contain a number.")
      .matches(/[^A-Za-z0-9]/).withMessage("Password must contain a special character.")
  ]
}

module.exports = validate