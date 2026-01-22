const users = [
  { email: "user@test.com", password: "user123", role: "user" },
  { email: "cs@test.com", password: "cs123", role: "cs" },
  { email: "finance@test.com", password: "finance123", role: "finance" }
];

document.getElementById("loginForm").addEventListener("submit", e => {
  e.preventDefault();

  const email = email.value;
  const password = password.value;
  const role = role.value;

  const found = users.find(
    u => u.email === email && u.password === password && u.role === role
  );

  if (!found) {
    document.getElementById("error").innerText = "Invalid credentials";
    return;
  }

  sessionStorage.setItem("authUser", JSON.stringify(found));
  window.location.href = "index.html";
});
