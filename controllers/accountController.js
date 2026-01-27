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

    res.render("account/account", {
        title: "Account Management",
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
      req.flash("notice", "Please check your credentials and try again.")
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

async function buildUpdateAccount(req, res) {
  let nav = await utilities.getNav()
  const account_id = req.params.account_id
  const loggedInId = res.locals.accountData.account_id
  const requestedId = parseInt(account_id)

  if (loggedInId !== requestedId) {
    req.flash("notice", "You are not authorized to update this account.")
    return res.redirect("/account/")
  }

  // Add account_id to locals (and first/last/email if you like)
  res.locals.account_id = account_id
  res.locals.account_firstname = res.locals.accountData.account_firstname
  res.locals.account_lastname = res.locals.accountData.account_lastname
  res.locals.account_email = res.locals.accountData.account_email

  res.render("account/update-account", {
    title: "Update Account",
    nav,
    errors: null
  })
}

async function updateAccount (req, res, next) {
  const nav = await utilities.getNav(res.locals.accountData)
  const { account_firstname, account_lastname, account_email } = req.body
  const account_id = res.locals.accountData.account_id // always use logged-in user ID

  try {
    const updateResult = await accountModel.updateAccount(
      account_id,
      account_firstname,
      account_lastname,
      account_email
    )

    if (updateResult) {
      req.flash("notice", "Account information updated successfully.")
      res.redirect("/account/")
    } else {
      req.flash("notice", "Sorry, the update failed.")
      res.render("account/update-account", {
        title: "Update Account",
        nav,
        errors: null,
        accountData: {
          account_id,
          account_firstname,
          account_lastname,
          account_email
        }
      })
    }
  } catch (error) {
    console.error(error)
    req.flash("notice", "An unexpected error occurred.")
    res.redirect("/account/")
  }
}


async function updatePassword(req, res) {
  const { account_id, account_password } = req.body

  if (!account_id) {
    req.flash("notice", "Account ID missing. Cannot update password.")
    return res.redirect("/account/")
  }

  const hashedPassword = await bcrypt.hash(account_password, 10)
  const updateResult = await accountModel.updatePassword(account_id, hashedPassword)

  if (updateResult) {
    req.flash("notice", "Password updated successfully.")
    res.redirect("/account/")
  } else {
    req.flash("notice", "Password update failed.")
    res.redirect("/account/")
  }
}


/* ****************************************
*  Validation Middleware
* *************************************** */
const updateAccountRules = () => [
  body("account_firstname").trim().notEmpty().withMessage("First name is required."),
  body("account_lastname").trim().notEmpty().withMessage("Last name is required."),
  body("account_email").trim().isEmail().withMessage("Valid email is required.")
    .custom(async (email, { req }) => {
      const existingAccount = await accountModel.getAccountByEmail(email)
      if (existingAccount && existingAccount.account_id != req.body.account_id) {
        throw new Error("Email already exists.")
      }
    })
]

const updatePasswordRules = () => [
  body("account_password")
    .isLength({ min: 12 }).withMessage("Password must be at least 12 characters.")
    .matches(/[A-Z]/).withMessage("Password must contain a capital letter.")
    .matches(/[0-9]/).withMessage("Password must contain a number.")
    .matches(/[^A-Za-z0-9]/).withMessage("Password must contain a special character.")
]

/* ****************************************
 *  Logout
 * *************************************** */
async function accountLogout(req, res) {
  try {
    
    res.clearCookie("jwt")

      if (req.session) {
      req.session.destroy(err => {
        if (err) console.error("Session destruction error:", err)
      });
    }

        req.flash("notice", "You have successfully logged out.")

    res.redirect("/")
  } catch (error) {
    console.error("Logout error:", error)
    res.redirect("/")
  }
}


module.exports = { buildLogin, buildRegister, registerAccount, buildManagement, accountLogin, buildAccountJWT, buildUpdateAccount, updateAccount, updatePassword, updateAccountRules, updatePasswordRules, accountLogout }
