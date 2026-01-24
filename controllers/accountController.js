const utilities = require("../utilities/")
const accountModel = require("../models/account-model")
const jwt = require("jsonwebtoken")
require("dotenv").config()
const bcrypt = require("bcryptjs")

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,
  })
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
  })
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  const nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(account_password, 10)

    // Save the account in the database
    const regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      hashedPassword
    )

    if (regResult) {
      req.flash("notice", `Congratulations, you're registered ${account_firstname}. Please log in.`)
      res.status(201).render("account/login", { title: "Login", nav })
    } else {
      req.flash("notice", "Sorry, the registration failed.")
      res.status(501).render("account/register", { title: "Register", nav })
    }
  } catch (error) {
    console.error(error)
    req.flash("notice", "An unexpected error occurred. Please try again.")
    res.status(500).render("account/register", { title: "Register", nav })
  }
}
/* ****************************************
*
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    account_password
  )

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    )
    res.status(201).render("account/login", {
      title: "Login",
      nav,
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
    })
  }
}
* *************************************** */
async function buildManagement(req, res) {
    let nav = await utilities.getNav()
    const message = req.flash("message")

    res.render("inventory/management", {
        title: "Inventory Management",
      nav, 
      message
        
    })
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
    return
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
      if(process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }
      return res.redirect("/account/")
    }
    else {
      req.flash("message notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    throw new Error('Access Forbidden')
  }
}

/* ****************************************
*  Build account management view
* *************************************** */
async function buildAccountJWT(req, res, next) {
  let nav = await utilities.getNav()
  const accountData = res.locals.accountData

  res.render("account/account", {
    title: "Account Management",
    nav,
    accountData,
    errors: null,
  })
}



/* ****************************************
*  Build account management view (JWT)

async function buildAccountJWT(req, res, next) {
  try {
    const nav = await utilities.getNav()
    const accountData = res.locals.accountData

    // Get flash messages (notice, success, error)
    const notice = req.flash("notice")
    const success = req.flash("success")
    const error = req.flash("error")

    res.render("account/account", {
      title: "Account Management",
      nav,
      accountData,
      errors: null,  // validation errors if any
      notice,
      success,
      error
    })
  } catch (err) {
    console.error("Error building account page:", err)
    res.status(500).render("account/account", {
      title: "Account Management",
      nav: [],
      accountData: {},
      errors: null,
      notice: ["An unexpected error occurred. Please try again."],
      success: [],
      error: []
    })
  }
}
* *************************************** */
module.exports = { buildLogin, buildRegister, registerAccount, buildManagement, accountLogin, buildAccountJWT }
