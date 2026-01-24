// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities/")
const invValidate = require("../utilities/inventory-validation")

// Route to build inventory by classification view
router.get(
    "/type/:classificationId",
    utilities.handleErrors(invController.buildByClassificationId)
)

// Dynamic route for a single vehicle detail view
router.get(
    "/detail/:inv_id",
    utilities.handleErrors(invController.buildDetailView)
)

// Route for inventory management view
router.get(
    "/",
    utilities.handleErrors(invController.buildManagement)
)

// View for adding classification
router.get(
  "/add-classification",
  utilities.handleErrors(invController.buildAddClassification)
)

router.get(
  "/add-inventory",
  utilities.handleErrors(invController.buildAddInventory)
)

router.get("/add", (req, res) => {
  res.redirect("/inv/add-inventory")
})
// Handle POST submission
router.post(
  "/add-classification",
  invValidate.classificationRules(),
  invValidate.checkClassificationData,
  utilities.handleErrors(invController.addClassification)
)

router.post(
  "/add-inventory",
  invValidate.addInventoryRules(),
  invValidate.checkInventoryData,
  utilities.handleErrors(invController.addInventory)
)

router.get(
  "/getInventory/:classification_id",
  utilities.checkAccountType,
  utilities.handleErrors(invController.getInventoryJSON)
)

// Edit inventory view
router.get(
  "/edit/:inv_id",
  utilities.checkAccountType,
  utilities.handleErrors(invController.buildEditInventory)
)

router.post(
  "/update",
  invValidate.addInventoryRules(),
  invValidate.checkUpdateData,
  utilities.handleErrors(invController.updateInventory)
)

module.exports = router;