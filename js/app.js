/* ---------- AUTH CHECK ---------- */
const authUser = JSON.parse(sessionStorage.getItem("authUser"));

if (!authUser) {
  window.location.replace("login.html");
}

/* ---------- UI SETUP ---------- */
document.getElementById("roleTitle").innerText =
  authUser.role === "admin" ? "Admin Dashboard" : "User Dashboard";

const form = document.getElementById("returnForm");
const userSection = document.getElementById("userSection");

const pendingList = document.getElementById("pendingList");
const processedList = document.getElementById("processedList");

let requests = JSON.parse(localStorage.getItem("requests")) || [];

/* Hide user form for admin */
if (authUser.role === "admin") {
  userSection.style.display = "none";
}

/* ---------- SUBMIT REQUEST ---------- */
form?.addEventListener("submit", e => {
  e.preventDefault();

  const orderId = document.getElementById("orderId").value;
  const reason = document.getElementById("reason").value;
  const comment = document.getElementById("comment").value;
  const file = document.getElementById("evidence").files[0];

  if (requests.some(r => r.orderId === orderId)) {
    alert("Duplicate Order ID detected");
    return;
  }

  if (!file) {
    alert("Supporting evidence is required.");
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    const request = {
      id: crypto.randomUUID(),
      orderId,
      reason,
      comment,
      evidence: reader.result,
      status: "Pending",
      message: "",      // USER-ONLY notification
      user: authUser.email,
      time: new Date().toISOString()
    };

    requests.push(request);
    save();
    form.reset();
  };

  reader.readAsDataURL(file);
});

/* ---------- RENDER REQUESTS ---------- */
function render() {
  pendingList.innerHTML = "";
  processedList.innerHTML = "";

  requests.forEach(r => {
    if (authUser.role === "user" && r.user !== authUser.email) return;

    let messageBlock = "";
    if (authUser.role === "user" && r.message) {
      messageBlock = `<div class="notification">${r.message}</div>`;
    }

    const li = document.createElement("li");
    li.className = r.status.toLowerCase();

    li.innerHTML = `
      <strong>Order ID:</strong> ${r.orderId}<br>
      <strong>Reason:</strong> ${r.reason}<br>
      <strong>Comment:</strong> ${r.comment || "—"}<br>
      <strong>Status:</strong> ${r.status}<br>
      ${messageBlock}
      <img src="${r.evidence}" />

      ${
        authUser.role === "admin" && r.status === "Pending"
          ? `<br>
             <button onclick="approveRequest('${r.id}')">Approve</button>
             <button onclick="rejectRequest('${r.id}')">Reject</button>`
          : ""
      }
    `;

    if (r.status === "Pending") {
      pendingList.appendChild(li);
    } else {
      processedList.appendChild(li);
    }
  });
}

/* ---------- ADMIN ACTIONS ---------- */
function approveRequest(id) {
  const req = requests.find(r => r.id === id);
  if (!req) return;

  req.status = "Approved";
  req.message = `Refund Initiated for Order #${req.orderId}. The payment will be credited to your respective bank account within 5–7 working days.`;

  save();
}

function rejectRequest(id) {
  const req = requests.find(r => r.id === id);
  if (!req) return;

  req.status = "Rejected";
  req.message = `Refund request for Order #${req.orderId} has been rejected after verification. Please contact customer support for further assistance.`;

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
