/* ---------- AUTH CHECK (CRITICAL) ---------- */
const authUser = JSON.parse(sessionStorage.getItem("authUser"));

if (!authUser) {
  window.location.replace("login.html");
}

/* ---------- UI SETUP ---------- */
document.getElementById("roleTitle").innerText =
  authUser.role === "admin" ? "Admin Dashboard" : "User Dashboard";

const form = document.getElementById("returnForm");
const list = document.getElementById("requestList");
const userSection = document.getElementById("userSection");

let requests = JSON.parse(localStorage.getItem("requests")) || [];

/* Hide user form for admin */
if (authUser.role === "admin") {
  userSection.style.display = "none";
}

/* ---------- SUBMIT REQUEST ---------- */
form?.addEventListener("submit", e => {
  e.preventDefault();

  const orderId = document.getElementById("orderId").value;

  if (requests.some(r => r.orderId === orderId)) {
    alert("Duplicate Order ID detected");
    return;
  }

  const request = {
    id: crypto.randomUUID(),
    orderId,
    reason: document.getElementById("reason").value,
    status: "Pending",
    user: authUser.email,
    time: new Date().toISOString()
  };

  requests.push(request);
  save();
  form.reset();
});

/* ---------- RENDER REQUESTS ---------- */
function render() {
  list.innerHTML = "";

  requests.forEach(r => {
    if (authUser.role === "user" && r.user !== authUser.email) return;

    const li = document.createElement("li");
    li.className = r.status.toLowerCase();

    li.innerHTML = `
      <strong>${r.orderId}</strong> | ${r.reason} | ${r.status}
      ${authUser.role === "admin" && r.status === "Pending"
        ? `<br>
           <button onclick="updateStatus('${r.id}','Approved')">Approve</button>
           <button onclick="updateStatus('${r.id}','Rejected')">Reject</button>`
        : ""}
    `;

    list.appendChild(li);
  });
}

/* ---------- UPDATE STATUS ---------- */
function updateStatus(id, status) {
  const req = requests.find(r => r.id === id);
  if (!req) return;

  req.status = status;
  save();
}

/* ---------- SAVE ---------- */
function save() {
  localStorage.setItem("requests", JSON.stringify(requests));
  render();
}

/* ---------- LOGOUT ---------- */
function logout() {
  sessionStorage.clear();
  window.location.replace("login.html");
}

render();
