const invModel = require("../models/inventory-model")
const Util = {}

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

/* ****************************************
 * Middleware For Handling Errors
 **************************************** */
Util.handleErrors = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next)

module.exports = Util
