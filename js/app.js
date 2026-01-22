/* ---------- AUTH CHECK ---------- */
const authUser = JSON.parse(sessionStorage.getItem("authUser"));
if (!authUser) window.location.replace("login.html");

/* ---------- ROLE TITLE ---------- */
const roleMap = {
  user: "User Dashboard",
  cs: "Customer Service Dashboard",
  finance: "Finance Admin Dashboard"
};

document.getElementById("roleTitle").innerText = roleMap[authUser.role];

/* ---------- ELEMENTS ---------- */
const form = document.getElementById("returnForm");
const userSection = document.getElementById("userSection");
const list = document.getElementById("requestList");

let requests = JSON.parse(localStorage.getItem("requests")) || [];

/* ---------- UI VISIBILITY ---------- */
if (authUser.role !== "user") {
  userSection.style.display = "none";
}

/* ---------- USER SUBMISSION ---------- */
form?.addEventListener("submit", e => {
  e.preventDefault();

  const orderId = document.getElementById("orderId").value;
  const reason = document.getElementById("reason").value;
  const comment = document.getElementById("comment").value;
  const file = document.getElementById("evidence").files[0];

  if (requests.some(r => r.orderId === orderId)) {
    alert("Duplicate Order ID");
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    requests.push({
      id: crypto.randomUUID(),
      orderId,
      reason,
      comment,
      evidence: reader.result,
      status: "Pending",
      csRemark: "",
      message: "",
      user: authUser.email,
      time: new Date().toISOString()
    });

    save();
    form.reset();
  };

  reader.readAsDataURL(file);
});

/* ---------- RENDER ---------- */
function render() {
  list.innerHTML = "";

  requests.forEach(r => {
    if (authUser.role === "user" && r.user !== authUser.email) return;

    let actions = "";

    // Customer Service
    if (authUser.role === "cs" && r.status === "Pending") {
      actions = `
        <textarea placeholder="CS Remark" onchange="addRemark('${r.id}', this.value)"></textarea>
        <button onclick="markReviewed('${r.id}')">Mark Reviewed</button>
      `;
    }

    // Finance Admin
    if (authUser.role === "finance" && r.status === "Reviewed") {
      actions = `
        <button onclick="approve('${r.id}')">Approve</button>
        <button onclick="reject('${r.id}')">Reject</button>
      `;
    }

    // User message
    let userMsg = "";
    if (authUser.role === "user" && r.message) {
      userMsg = `<div class="notification">${r.message}</div>`;
    }

    const li = document.createElement("li");
    li.className = r.status.toLowerCase();
    li.innerHTML = `
      <strong>Order:</strong> ${r.orderId}<br>
      <strong>Status:</strong> ${r.status}<br>
      <strong>Comment:</strong> ${r.comment}<br>
      ${r.csRemark ? `<strong>CS Remark:</strong> ${r.csRemark}<br>` : ""}
      ${userMsg}
      <img src="${r.evidence}" />
      ${actions}
    `;

    list.appendChild(li);
  });
}

/* ---------- CS ACTIONS ---------- */
function addRemark(id, text) {
  const r = requests.find(x => x.id === id);
  if (r) r.csRemark = text;
}

function markReviewed(id) {
  const r = requests.find(x => x.id === id);
  if (r) {
    r.status = "Reviewed";
    save();
  }
}

/* ---------- FINANCE ACTIONS ---------- */
function approve(id) {
  const r = requests.find(x => x.id === id);
  if (r) {
    r.status = "Approved";
    r.message = `Refund Initiated for Order #${r.orderId}. Amount will be credited within 5–7 working days.`;
    save();
  }
}

function reject(id) {
  const r = requests.find(x => x.id === id);
  if (r) {
    r.status = "Rejected";
    r.message = `Refund request for Order #${r.orderId} was rejected after verification.`;
    save();
  }
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
