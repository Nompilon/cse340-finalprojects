const utilities = require(".")
const { body, validationResult } = require("express-validator")
const validate = {}


/* ----- classification Validation ----- */
validate.classificationRules = () => {
  return [
    body("classification_name")
  .trim()
  .matches(/^[a-zA-Z0-9 ]+$/)
  .withMessage("Classification name can only contain letters and numbers.")
  .isLength({ min: 1 })
  .withMessage("Classification name is required.")
  ]
}

validate.checkClassificationData = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    return res.render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors: errors.array(),
      messages: req.flash("notice"),
      classification_name: req.body.classification_name
    })
  }
  next()
}

/* ----- Inventory Validation ----- */
validate.addInventoryRules = () => {
  return [
    // Make: required, min 2 characters
    body("inv_make")
      .trim()
      .notEmpty()
      .withMessage("Make is required")
      .isLength({ min: 2 })
      .withMessage("Make must be at least 2 characters"),

    // Model: required, min 2 characters
    body("inv_model")
      .trim()
      .notEmpty()
      .withMessage("Model is required")
      .isLength({ min: 2 })
      .withMessage("Model must be at least 2 characters"),

    // Year: required, integer between 1900 and current year
    body("inv_year")
      .notEmpty()
      .withMessage("Year is required")
      .isInt({ min: 1900, max: new Date().getFullYear() })
      .withMessage(`Year must be between 1900 and ${new Date().getFullYear()}`),

    // Description: required, min 10 characters
    body("inv_description")
      .trim()
      .notEmpty()
      .withMessage("Description is required")
      .isLength({ min: 10 })
      .withMessage("Description must be at least 10 characters"),

    // Price: required, positive float
    body("inv_price")
      .notEmpty()
      .withMessage("Price is required")
      .isFloat({ min: 0 })
      .withMessage("Price must be a positive number"),

    // Miles: required, positive integer
    body("inv_miles")
      .notEmpty()
      .withMessage("Mileage is required")
      .isInt({ min: 0 })
      .withMessage("Mileage must be a positive integer"),

    // Color: required, min 2 characters
    body("inv_color")
      .trim()
      .notEmpty()
      .withMessage("Color is required")
      .isLength({ min: 2 })
      .withMessage("Color must be at least 2 characters"),

    // Classification: required, integer
    body("classification_id")
      .notEmpty()
      .withMessage("Classification is required")
      .isInt({ min: 1 })
      .withMessage("Classification must be a valid selection"),

    // Optional fields for image URLs: must be valid URLs if provided
    body("inv_image")
      .optional({ checkFalsy: true })
      .matches(/^(https?:\/\/.+|\/images\/.+)$/)
      .withMessage("Image must be a valid URL or image path"),

    body("inv_thumbnail")
      .optional({ checkFalsy: true })
      .matches(/^(https?:\/\/.+|\/images\/.+)$/)
      .withMessage("Image must be a valid URL or image path"),

  ]
}


validate.checkInventoryData = async (req, res, next) => {
  const result = validationResult(req)

  if (!result.isEmpty()) {
    const nav = await require("../utilities").getNav()
    const classificationSelect = await require("../utilities").buildClassificationList()

    // Put sticky values into res.locals
    res.locals.inv_make = req.body.inv_make
    res.locals.inv_model = req.body.inv_model
    res.locals.inv_year = req.body.inv_year
    res.locals.inv_description = req.body.inv_description
    res.locals.inv_price = req.body.inv_price
    res.locals.inv_miles = req.body.inv_miles
    res.locals.inv_color = req.body.inv_color
    res.locals.classification_id = req.body.classification_id
    res.locals.inv_image = req.body.inv_image
    res.locals.inv_thumbnail = req.body.inv_thumbnail

    return res.render("inventory/add-inventory", {
      title: "Add Vehicle",
      nav,
      classificationSelect,
      errors: result.array(),   // convert validationResult to array
      messages: () => req.flash("notice")
    })
  }
  next()
}

validate.checkUpdateData = async (req, res, next) => {
  const result = validationResult(req)

  if (!result.isEmpty()) {
    const nav = await require("../utilities").getNav()
    const classificationSelect =
  await require("../utilities").buildClassificationList(req.body.classification_id)
    // Put sticky values into res.locals
    res.locals.inv_make = req.body.inv_make
    res.locals.inv_model = req.body.inv_model
    res.locals.inv_year = req.body.inv_year
    res.locals.inv_description = req.body.inv_description
    res.locals.inv_price = req.body.inv_price
    res.locals.inv_miles = req.body.inv_miles
    res.locals.inv_color = req.body.inv_color
    res.locals.classification_id = req.body.classification_id
    res.locals.inv_image = req.body.inv_image
    res.locals.inv_thumbnail = req.body.inv_thumbnail

    const inv_id = req.body.inv_id
    return res.render("inventory/edit-inventory", {
      title: "Edit Vehicle",
      nav,
      classificationSelect,
      errors: result.array(),   // convert validationResult to array
      //messages: () => req.flash("notice"),
      inv_id: req.body.inv_id
    })
  }
  next()
}

module.exports = validate