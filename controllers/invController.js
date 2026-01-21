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
 * Build add classification view
 * ************************** */
invCont.buildAddClassification = async (req, res) => {
  const nav = await utilities.getNav()
  res.render("inventory/add-classification", {
    title: "Add Classification",
    nav,
    errors: null,
    classification_name: null
  })
}
/* ***************************
 * Handle adding new classification
 * ************************** */
invCont.addClassification = async (req, res, next) => {
  try {
    const { classification_name } = req.body
    const addResult = await invModel.addClassification(classification_name)
    const nav = await utilities.getNav()

    if (addResult) {
      req.flash("notice", "Classification successfully added!")
      return res.redirect("/inv")
    } else {
      return res.render("inventory/add-classification", {
        title: "Add Classification",
        nav,
        errors: [{ msg: "Failed to add classification. Try again." }],
        classification_name
      })
    }
  } catch (err) {
    next(err)
  }
}


/* ***************************
 * Build add inventory view
 * ************************** */
invCont.buildAddInventory = async (req, res, next) => {
  try {
    const nav = await utilities.getNav()
    const classifications = await utilities.getClassificationOptions()

    res.render("inventory/add-inventory", {
      title: "Add Vehicle",
      nav,
      errors: null,
      classifications,
      vehicle: {} // empty object for sticky form
    })
  } catch (err) {
    next(err)
  }
}

/* ***************************
 * Handle adding new inventory
 * ************************** */
invCont.addInventory = async (req, res, next) => {
  try {
    const vehicleData = {
      ...req.body,
      inv_image: req.body.inv_image || "/images/no-image-available.png",
      inv_thumbnail: req.body.inv_thumbnail || "/images/no-image-available-thumb.png"
    }

    const result = await invModel.addInventory(vehicleData)

    if (result) {
      req.flash(
        "notice",
        `Vehicle ${vehicleData.inv_make} ${vehicleData.inv_model} added successfully!`
      )
      return res.redirect("/inv")
    } else {
  const classifications = await utilities.getClassificationOptions()

  return res.render("inventory/add-inventory", {
    title: "Add Vehicle",
    nav: await utilities.getNav(),
    errors: [{ msg: "Failed to add vehicle. Please try again." }],
    classifications,
    vehicle: vehicleData
  })
}

  } catch (error) {
    next(error)
  }
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

/* ***************************
 *  Build Management view
 * ************************** */
invCont.buildManagement = async (req, res) => {
  const nav = await utilities.getNav()
  res.render("inventory/management", {
    title: "Inventory Management",
    nav
  })
}


module.exports = invCont