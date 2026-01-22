/* ---------- AUTH ---------- */
const authUser = JSON.parse(sessionStorage.getItem("authUser"));
if (!authUser) location.replace("login.html");

/* ---------- ELEMENT SAFETY ---------- */
const $ = id => document.getElementById(id);

/* ---------- ROLE TITLE ---------- */
$("roleTitle").innerText =
  authUser.role === "user"
    ? "User Dashboard"
    : authUser.role === "cs"
    ? "Customer Service Dashboard"
    : "Finance Admin Dashboard";

/* ---------- DATA ---------- */
let requests = JSON.parse(localStorage.getItem("requests")) || [];
let queries = JSON.parse(localStorage.getItem("queries")) || [];

/* ---------- MENU VISIBILITY ---------- */
$("menuUser").style.display = authUser.role === "user" ? "block" : "none";
$("menuCS").style.display = authUser.role === "cs" ? "block" : "none";
$("menuFinance").style.display = authUser.role === "finance" ? "block" : "none";

/* ---------- SECTION CONTROL ---------- */
function showSection(id) {
  document.querySelectorAll(".section").forEach(s => s.style.display = "none");
  const sec = $(id);
  if (sec) sec.style.display = "block";
}

/* ---------- DEFAULT LANDING ---------- */
if (authUser.role === "user") showSection("history");
if (authUser.role === "cs") showSection("pending");
if (authUser.role === "finance") showSection("reviewed");

/* ---------- CREATE REQUEST ---------- */
$("returnForm")?.addEventListener("submit", e => {
  e.preventDefault();

  const file = $("evidence").files[0];
  if (!file) return alert("Evidence required");

  const reader = new FileReader();
  reader.onload = () => {
    requests.push({
      id: crypto.randomUUID(),
      orderId: $("orderId").value,
      reason: $("reason").value,
      comment: $("comment").value,
      evidence: reader.result,
      status: "Pending",
      user: authUser.email,
      message: "",
      time: Date.now()
    });
    save();
    e.target.reset();
  };
  reader.readAsDataURL(file);
});

/* ---------- RENDER ---------- */
function render() {
  $("historyList").innerHTML = "";
  $("pendingList").innerHTML = "";
  $("reviewedList").innerHTML = "";

  requests.forEach(r => {
    const card = document.createElement("div");
    card.className = `card ${r.status.toLowerCase()}`;
    card.innerHTML = `
      <b>Order:</b> ${r.orderId}<br>
      <b>Status:</b> ${r.status}<br>
      <b>Reason:</b> ${r.reason}<br>
      <b>Comment:</b> ${r.comment}
      ${r.message ? `<p>${r.message}</p>` : ""}
      <img src="${r.evidence}">
    `;

    if (authUser.role === "user" && r.user === authUser.email) {
      $("historyList").appendChild(card);
    }

    if (authUser.role === "cs" && r.status === "Pending") {
      card.innerHTML += `<button onclick="review('${r.id}')">Mark Reviewed</button>`;
      $("pendingList").appendChild(card);
    }

    if (authUser.role === "finance" && r.status === "Reviewed") {
      card.innerHTML += `
        <button onclick="approve('${r.id}')">Approve</button>
        <button onclick="reject('${r.id}')">Reject</button>`;
      $("reviewedList").appendChild(card);
    }
  });
}

/* ---------- WORKFLOW ---------- */
function review(id) {
  const r = requests.find(x => x.id === id);
  r.status = "Reviewed";
  save();
}

function approve(id) {
  const r = requests.find(x => x.id === id);
  r.status = "Approved";
  r.message = `Refund initiated. Amount credited in 5–7 working days.`;
  save();
}

function reject(id) {
  const r = requests.find(x => x.id === id);
  r.status = "Rejected";
  r.message = `Refund request rejected after verification.`;
  save();
}

function save() {
  localStorage.setItem("requests", JSON.stringify(requests));
  render();
}

function logout() {
  sessionStorage.clear();
  location.replace("login.html");
}

render();
