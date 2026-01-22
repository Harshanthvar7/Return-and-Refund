const authUser = JSON.parse(sessionStorage.getItem("authUser"));
if (!authUser) window.location.href = "login.html";

document.getElementById("roleTitle").innerText =
  authUser.role === "admin" ? "Admin Dashboard" : "User Dashboard";

const form = document.getElementById("returnForm");
const list = document.getElementById("requestList");
const userSection = document.getElementById("userSection");

let requests = JSON.parse(localStorage.getItem("requests")) || [];
let logs = JSON.parse(localStorage.getItem("logs")) || [];

if (authUser.role === "admin") userSection.style.display = "none";

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
  log("REQUEST_SUBMITTED");
  save();
  form.reset();
});

function render() {
  list.innerHTML = "";

  requests.forEach(r => {
    if (authUser.role === "user" && r.user !== authUser.email) return;

    const li = document.createElement("li");
    li.className = r.status.toLowerCase();
    li.innerHTML = `
      <strong>${r.orderId}</strong> - ${r.reason} - ${r.status}
      ${authUser.role === "admin" && r.status === "Pending"
        ? `<br><button onclick="approve('${r.id}')">Approve</button>
           <button onclick="reject('${r.id}')">Reject</button>`
        : ""}
    `;
    list.appendChild(li);
  });
}

function approve(id) {
  updateStatus(id, "Approved");
}

function reject(id) {
  updateStatus(id, "Rejected");
}

function updateStatus(id, status) {
  const r = requests.find(x => x.id === id);
  if (!r) return;

  r.status = status;
  log(`REQUEST_${status.toUpperCase()}`);
  save();
}

function log(action) {
  logs.push({
    user: authUser.email,
    action,
    time: new Date().toISOString()
  });
}

function save() {
  localStorage.setItem("requests", JSON.stringify(requests));
  localStorage.setItem("logs", JSON.stringify(logs));
  render();
}

function logout() {
  sessionStorage.clear();
  window.location.href = "login.html";
}

render();
