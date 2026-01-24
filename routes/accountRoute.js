// Needed resources
const express = require("express")
const router = new express.Router()
const utilities = require("../utilities")
const accountController = require("../controllers/accountController")
const regValidate = require('../utilities/account-validation')
//const { checkJWTToken } = require("../utilities")
// Login page
router.get(
  "/login",
  utilities.handleErrors(accountController.buildLogin)
)

// Registration page
router.get(
  "/register",
  utilities.handleErrors(accountController.buildRegister)
)

// Process the registration data
router.post(
  "/register",
  regValidate.registrationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)

// Process the login request
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
)

// Default account page (after login)
router.get(
  "/",
  utilities.checkJWTToken,
  utilities.handleErrors(accountController.buildAccountJWT)
)
module.exports = router