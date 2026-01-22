const users = [
    { email: "user@test.com", password: "user123", role: "user" },
    { email: "admin@test.com", password: "admin123", role: "admin" }
  ];
  
  const form = document.getElementById("loginForm");
  
  form?.addEventListener("submit", e => {
    e.preventDefault();
  
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
  
    const user = users.find(
      u => u.email === email && u.password === password
    );
  
    if (!user) {
      document.getElementById("error").innerText = "Invalid credentials";
      return;
    }
  
    sessionStorage.setItem("authUser", JSON.stringify(user));
    window.location.replace("index.html");
  });
  