const invModel = require("../models/inventory-model")
const Util = {}
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function () {
  let data = await invModel.getClassifications()
  let list = "<ul>"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += "<li>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += '<li><a href="/inv/add" title="Add a new inventory item">Add Inventory </a></li>'

  list += "</ul>"
  return list
}

/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function (data) {
  let grid = ""

  if (data.length > 0) {
    grid = '<ul id="inv-display">'
    data.forEach((vehicle) => {
      grid += "<li>"
      grid +=
        '<a href="/inv/detail/' +
        vehicle.inv_id +
        '" title="View ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        ' details"><img src="' +
        vehicle.inv_thumbnail +
        '" alt="Image of ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        ' on CSE Motors" /></a>'
      grid += '<div class="namePrice">'
      grid += "<hr />"
      grid += "<h2>"
      grid +=
        '<a href="/inv/detail/' +
        vehicle.inv_id +
        '" title="View ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        ' details">' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        "</a>"
      grid += "</h2>"
      grid +=
        "<span>$" +
        new Intl.NumberFormat("en-US").format(vehicle.inv_price) +
        "</span>"
      grid += "</div>"
      grid += "</li>"
    })
    grid += "</ul>"
  } else {
    grid = '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }

  return grid
}

Util.getClassificationOptions = async function () {
  const data = await invModel.getClassifications(); // returns rows
  let options = '<option value="">Select a classification</option>'

  data.rows.forEach((row) => {
    options += `<option value="${row.classification_id}">${row.classification_name}</option>`
  })

  return options
}

/* ******************************************
 * Build HTML for a single vehicle detail
 ****************************************** */
Util.buildVehicleDetail = function (vehicle) {
  const price = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(vehicle.inv_price)
  const mileage = new Intl.NumberFormat("en-US").format(vehicle.inv_miles)

  return `
  <div class="vehicle-detail-grid">
    <div class="vehicle-image">
      <img src="${vehicle.inv_image}" alt="Image of ${vehicle.inv_make} ${vehicle.inv_model}" />
      <div class="vehicle-actions">
        <a href="#" class="btn primary">Start My Purchase</a>
        <a href="/contact" class="btn secondary">Contact Us</a>
        <a href="/schedule-test-drive" class="btn accent">Schedule Test Drive</a>
        <a href="/refer" class="btn info">Refer a Friend</a>
      </div>
    </div>

    <div class="vehicle-info">
      <h1>${vehicle.inv_make} ${vehicle.inv_model} (${vehicle.inv_year})</h1>
      <h2> ${mileage} Mileage for just ${price} </h2>
      <p><strong>Price:</strong> ${price}</p>
      <p><strong>Mileage:</strong> ${mileage} miles</p>
      <p><strong>Description:</strong> ${vehicle.inv_description}</p>
      <p><strong>Color:</strong> ${vehicle.inv_color}</p>
      <p><strong>Body Type:</strong> ${vehicle.inv_body}</p>
      <p><strong>Transmission:</strong> ${vehicle.inv_transmission}</p>
      <p><strong>Fuel:</strong> ${vehicle.inv_fuel}</p>
    </div>
  </div>
`
}

Util.buildClassificationList = async function (classification_id = null) {
    let data = await invModel.getClassifications()
    let classificationList =
      '<select name="classification_id" id="classificationList" required>'
    classificationList += "<option value=''>Choose a Classification</option>"
    data.rows.forEach((row) => {
      classificationList += '<option value="' + row.classification_id + '"'
      if (
        classification_id != null &&
        row.classification_id == classification_id
      ) {
        classificationList += " selected "
      }
      classificationList += ">" + row.classification_name + "</option>"
    })
    classificationList += "</select>"
    return classificationList
  }

/* ****************************************
 * Middleware For Handling Errors
 **************************************** */
Util.handleErrors = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next)


/* ****************************************
* Middleware to check token validity


Util.checkJWTToken = (req, res, next) => {
  const token = req.cookies?.jwt

  if (!token) {
    res.locals.loggedin = 0
    return next()
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, accountData) => {
    if (err) {
      res.clearCookie("jwt")
      res.locals.loggedin = 0
      return next()
    }

    res.locals.accountData = accountData
    res.locals.loggedin = 1
    next()
  })
}
**************************************** */

Util.checkJWTToken = (req, res, next) => {
  const token = req.cookies?.jwt; // optional chaining in case cookies undefined
  if (token) {
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        // Token invalid — log out
        res.clearCookie('jwt');
        res.locals.accountData = null; // VERY IMPORTANT
        res.locals.loggedin = false;
        return next();
      }
      // Token valid — save account info
      res.locals.accountData = decoded; // this is what EJS reads
      res.locals.loggedin = true;
      next();
    });
  } else {
    // No token
    res.locals.accountData = null;
    res.locals.loggedin = false;
    next();
  }
};
/* ****************************************
 *  Check Login
 * ************************************ */
 Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next()
  } else {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }
 }

 Util.checkAccountType = (req, res, next) => {
  try {
    // Must be logged in first
    if (!res.locals.accountData) {
      req.flash("notice", "Please log in to continue.")
      return res.redirect("/account/login")
    }

    const accountType = res.locals.accountData.account_type

    // Allow only Employee or Admin to access certain routes
    if (accountType === "Employee" || accountType === "Admin") {
      return next()
    }

    // Client accounts are blocked
    req.flash("notice", "You are not authorized to access this resource.")
    return res.redirect("/account/")
  } catch (error) {
    console.error("checkAccountType error:", error)
    req.flash("notice", "Access denied.")
    return res.redirect("/")
  }
}

module.exports = Util
