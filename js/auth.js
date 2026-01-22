const users = [
  { email: "user@test.com", password: "user123", role: "user" },
  { email: "cs@test.com", password: "cs123", role: "cs" },
  { email: "finance@test.com", password: "finance123", role: "finance" }
];

document.getElementById("loginForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const emailInput = document.getElementById("email").value;
  const passwordInput = document.getElementById("password").value;
  const roleInput = document.getElementById("role").value;

  const user = users.find(
    u =>
      u.email === emailInput &&
      u.password === passwordInput &&
      u.role === roleInput
  );

  if (!user) {
    document.getElementById("error").innerText =
      "Invalid email, password, or role";
    return;
  }

  sessionStorage.setItem("authUser", JSON.stringify(user));
  window.location.href = "index.html";
});
