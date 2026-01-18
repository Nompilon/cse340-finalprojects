// Creates an intentional server-side crash
async function triggerError(req, res, next) {
  throw new Error("Intentional server crash for testing error handling.")
}

module.exports = { triggerError }
