const form = document.querySelector("#updateForm")
if (form) {
  form.addEventListener("change", function () {
    const buttons = form.querySelectorAll("button, input[type='submit']");
    buttons.forEach(btn => btn.removeAttribute("disabled"))
  })
}