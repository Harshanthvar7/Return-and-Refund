/* =========================
   AUTH & ROLE SETUP
========================= */
const authUser = JSON.parse(sessionStorage.getItem("authUser"));
if (!authUser) location.replace("login.html");

const roleTitleMap = {
  user: "User Dashboard",
  cs: "Customer Service Dashboard",
  finance: "Finance Admin Dashboard"
};

document.getElementById("roleTitle").innerText =
  roleTitleMap[authUser.role];

/* =========================
   DATA STORES
========================= */
let requests = JSON.parse(localStorage.getItem("requests")) || [];
let queries = JSON.parse(localStorage.getItem("queries")) || [];

/* =========================
   MENU VISIBILITY
========================= */
menuUser.style.display = authUser.role === "user" ? "block" : "none";
menuCS.style.display = authUser.role === "cs" ? "block" : "none";
menuFinance.style.display = authUser.role === "finance" ? "block" : "none";

/* =========================
   SECTION CONTROL
========================= */
function showSection(id) {
  document.querySelectorAll(".section").forEach(
    sec => (sec.style.display = "none")
  );
  document.getElementById(id).style.display = "block";
}

/* Default landing */
if (authUser.role === "user") showSection("history");
if (authUser.role === "cs") showSection("pendingRequests");
if (authUser.role === "finance") showSection("refundStatus");

/* =========================
   USER — CREATE REQUEST
========================= */
returnForm?.addEventListener("submit", e => {
  e.preventDefault();

  const file = evidence.files[0];
  if (!file) {
    alert("Supporting evidence is required.");
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    requests.push({
      id: crypto.randomUUID(),
      orderId: orderId.value,
      reason: reason.value,
      comment: comment.value,
      evidence: reader.result,
      status: "Pending",
      user: authUser.email,
      message: "",
      time: Date.now()
    });

    saveAndRender();
    e.target.reset();
  };

  reader.readAsDataURL(file);
});

/* =========================
   USER — CUSTOMER SUPPORT QUERY
   (Evidence OPTIONAL)
========================= */
queryForm?.addEventListener("submit", e => {
  e.preventDefault();

  const file = queryImage.files[0];
  const reader = new FileReader();

  reader.onload = () => {
    queries.push({
      id: crypto.randomUUID(),
      text: queryText.value,
      image: reader.result || "",
      user: authUser.email,
      status: "Open",
      time: Date.now()
    });

    saveAndRender();
    e.target.reset();
  };

  if (file) reader.readAsDataURL(file);
  else reader.onload();
});

/* =========================
   RENDER ENGINE
========================= */
function render() {
  historyList.innerHTML = "";
  pendingList.innerHTML = "";
  refundList.innerHTML = "";
  queryList.innerHTML = "";

  historyList.className = "grid";
  pendingList.className = "grid";
  refundList.className = "grid";

  /* ---------- USER VIEW ---------- */
  if (authUser.role === "user") {
    const priority = { Pending: 1, Reviewed: 2, Approved: 3, Rejected: 4 };

    requests
      .filter(r => r.user === authUser.email)
      .sort((a, b) =>
        priority[a.status] !== priority[b.status]
          ? priority[a.status] - priority[b.status]
          : b.time - a.time
      )
      .forEach(r => historyList.appendChild(buildCard(r)));
  }

  /* ---------- CUSTOMER SERVICE ---------- */
  if (authUser.role === "cs") {
    requests
      .filter(r => r.status === "Pending")
      .forEach(r => {
        const card = buildCard(r);
        card.innerHTML += `
          <button onclick="markReviewed('${r.id}')">
            Mark as Reviewed
          </button>
        `;
        pendingList.appendChild(card);
      });
  }

  /* ---------- FINANCE ADMIN ---------- */
  if (authUser.role === "finance") {
    requests
      .filter(r => r.status === "Reviewed")
      .forEach(r => {
        const card = buildCard(r);
        card.innerHTML += `
          <button onclick="approve('${r.id}')">Approve</button>
          <button onclick="reject('${r.id}')">Reject</button>
        `;
        refundList.appendChild(card);
      });
  }

  /* ---------- QUERIES ---------- */
  queries.forEach(q => {
    if (authUser.role === "user" && q.user !== authUser.email) return;

    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <b>Query:</b> ${q.text}<br>
      <b>User:</b> ${q.user}
      ${q.image ? `<img src="${q.image}">` : ""}
    `;
    queryList.appendChild(card);
  });
}

/* =========================
   CARD BUILDER
========================= */
function buildCard(r) {
  const card = document.createElement("div");
  card.className = `card ${r.status.toLowerCase()}`;

  card.innerHTML = `
    <b>Order ID:</b> ${r.orderId}<br>
    <b>Reason:</b> ${r.reason}<br>
    <b>Comment:</b> ${r.comment}<br>
    <b>Status:</b> ${r.status}
    ${r.message ? `<div class="notification">${r.message}</div>` : ""}
    <img src="${r.evidence}">
  `;

  return card;
}

/* =========================
   WORKFLOW ACTIONS
========================= */
function markReviewed(id) {
  const r = requests.find(x => x.id === id);
  if (!r) return;

  r.status = "Reviewed";
  saveAndRender();
}

function approve(id) {
  const r = requests.find(x => x.id === id);
  if (!r) return;

  r.status = "Approved";
  r.message =
    `Refund Initiated for Order #${r.orderId}. ` +
    `The amount will be credited to your bank account within 5–7 working days.`;

  saveAndRender();
}

function reject(id) {
  const r = requests.find(x => x.id === id);
  if (!r) return;

  r.status = "Rejected";
  r.message =
    `Refund request for Order #${r.orderId} was rejected after verification.`;

  saveAndRender();
}

/* =========================
   SAVE & LOGOUT
========================= */
function saveAndRender() {
  localStorage.setItem("requests", JSON.stringify(requests));
  localStorage.setItem("queries", JSON.stringify(queries));
  render();
}

function logout() {
  sessionStorage.clear();
  location.replace("login.html");
}

/* INITIAL RENDER */
render();
