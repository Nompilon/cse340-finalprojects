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
  let nav = await utilities.getNav(res.locals.accountData)
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
invCont.buildAddClassification = async (req, res, next) => {
  const nav = await utilities.getNav(res.locals.accountData)
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
    const nav = await utilities.getNav(res.locals.accountData)

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
    const nav = await utilities.getNav(res.locals.accountData)
    const classificationSelect= await utilities.getClassificationOptions()

    res.render("inventory/add-inventory", {
      title: "Add Vehicle",
      nav,
      errors: null,
      classificationSelect,
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
  const classificationSelect = await utilities.getClassificationOptions()

  return res.render("inventory/add-inventory", {
    title: "Add Vehicle",
    nav: await utilities.getNav(res.locals.accountData),
    errors: [{ msg: "Failed to add vehicle. Please try again." }],
    classificationSelect,
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
    const nav = await utilities.getNav(res.locals.accountData)

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
invCont.buildManagement = async (req, res, next) => {
  let nav = await utilities.getNav(res.locals.accountData)
  const classificationSelect = await utilities.buildClassificationList()
  res.render("./inventory/management", {
    title: "Inventory Management",
    nav,
    classificationSelect,
    errors: null,
  })
}
    

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}

/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.buildEditInventory = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav(res.locals.accountData)
  const itemData = await invModel.getInventoryById(inv_id)
  const classificationSelect = await utilities.buildClassificationList(itemData.classification_id)
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`
  res.render("./inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_price: itemData.inv_price,
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color,
    classification_id: itemData.classification_id
  })
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  let nav = await utilities.getNav(res.locals.accountData)
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body

  const updateResult = await invModel.updateInventory(
    inv_id,  
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
  )
  if (updateResult) {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model
    req.flash("notice", `The ${itemName} was successfully updated.`)
    res.redirect("/inv/")
  } else {
    const classificationSelect = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, the update failed.")
    res.status(501).render("inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id
    })
  }
}

/* ***************************
 *  Build delete confirmation view
 * ************************** */
invCont.buildDeleteInventory = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav(res.locals.accountData)
  const itemData = await invModel.getInventoryById(inv_id)
  const classificationSelect = await utilities.buildClassificationList(itemData.classification_id)
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`
  res.render("./inventory/delete-confirm", {
    title: "Delete " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_price: itemData.inv_price,
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color,
    classification_id: itemData.classification_id
  })
}

 /* ***************************
 *  Delete Inventory Data
 * ************************** */
invCont.deleteInventory = async function (req, res, next) {
  let nav = await utilities.getNav(res.locals.accountData)
  const {
    inv_id,
    inv_make,
    inv_model,
    classification_id,
  } = req.body

  const deleteResult = await invModel.deleteInventory(inv_id,)

  if (deleteResult) {
    const itemName = deleteResult.inv_make + " " + deleteResult.inv_model
    req.flash("notice", `The ${itemName} was successfully deleted.`)
    res.redirect("/inv/")
  } else {
    const classificationSelect = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, the delete failed.")
    res.status(501).render("inventory/delete-confirm", {
    title: "Delete " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id,
    inv_make,
    inv_model,
    classification_id
    })
  }
}   

module.exports = invCont