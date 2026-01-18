const allowedEmails = [
  "brightpathaftercare@gmail.com",
  "shaunmatsetela@gmail.com"
];

const PASSWORD = "brightybud123";

const form = document.getElementById("login-form");
const error = document.getElementById("error");
const toggle = document.getElementById("togglePassword");
const passwordInput = document.getElementById("password");

toggle.addEventListener("click", () => {
  passwordInput.type =
    passwordInput.type === "password" ? "text" : "password";
  toggle.textContent =
    passwordInput.type === "password" ? "Show" : "Hide";
});

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = passwordInput.value.trim();

  if (!allowedEmails.includes(email)) {
    error.textContent = "Access denied.";
    return;
  }

  if (password !== PASSWORD) {
    error.textContent = "Incorrect password.";
    return;
  }

  // SUCCESS
  localStorage.setItem("brightpath_logged_in", "true");
  window.location.href = "admin.html";
});
