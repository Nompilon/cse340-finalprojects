// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities/")

// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId)
)

// Dynamic route for a single vehicle detail view
router.get("/detail/:inv_id", utilities.handleErrors(invController.buildDetailView)
)

module.exports = router;