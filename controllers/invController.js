const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}

/* ***************************
 *  Build single vehicle detail view
 * ************************** */
invCont.buildDetailView = async function (req, res, next) {
  try {
    const invId = req.params.inv_id

    // Get vehicle data from the model
    const vehicle = await invModel.getVehicleById(invId)

    if (!vehicle) {
      return next(new Error("Vehicle not found"))
    }

    // Generate navigation
    const nav = await utilities.getNav()

    // Generate vehicle HTML
    const vehicleDetail = await utilities.buildVehicleDetail(vehicle)

    // Pass all data to EJS
    res.render("inventory/detail", {
      title: `${vehicle.inv_make} ${vehicle.inv_model}`,
      nav,
      vehicleDetail,   // <- THIS IS CRUCIAL
    })
  } catch (error) {
    next(error)
  }
}

module.exports = invCont