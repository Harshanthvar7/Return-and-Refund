const users = [
    { email: "user@test.com", password: "user123", role: "user" },
    { email: "cs@test.com", password: "cs123", role: "cs" },
    { email: "finance@test.com", password: "finance123", role: "finance" }
  ];
  
  document.getElementById("loginForm")?.addEventListener("submit", e => {
    e.preventDefault();
  
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const role = document.getElementById("role").value;
  
    const user = users.find(
      u => u.email === email && u.password === password && u.role === role
    );
  
    if (!user) {
      document.getElementById("error").innerText = "Invalid credentials or role";
      return;
    }
  
    sessionStorage.setItem("authUser", JSON.stringify(user));
    window.location.replace("index.html");
  });
  