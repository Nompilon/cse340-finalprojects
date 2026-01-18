const express = require("express")
const router = express.Router()
const errorController = require("../controllers/errorController")
const utilities = require("../utilities/")

// Route that intentionally triggers a 500 error
router.get(
  "/cause-error",
  utilities.handleErrors(errorController.triggerError)
)

module.exports = router
