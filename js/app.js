const authUser = JSON.parse(sessionStorage.getItem("authUser"));
if (!authUser) location.replace("login.html");

/* ---------- ROLE TITLE ---------- */
const roleTitle = {
  user: "User Dashboard",
  cs: "Customer Service Dashboard",
  finance: "Finance Admin Dashboard"
};
document.getElementById("roleTitle").innerText = roleTitle[authUser.role];

/* ---------- STORAGE ---------- */
let requests = JSON.parse(localStorage.getItem("requests")) || [];
let queries = JSON.parse(localStorage.getItem("queries")) || [];

/* ---------- MENU VISIBILITY ---------- */
menuUser.style.display = authUser.role === "user" ? "block" : "none";
menuCS.style.display = authUser.role === "cs" ? "block" : "none";
menuFinance.style.display = authUser.role === "finance" ? "block" : "none";

/* ---------- SECTION CONTROL ---------- */
function showSection(id) {
  document.querySelectorAll(".section").forEach(s => s.style.display = "none");
  document.getElementById(id).style.display = "block";
}

showSection(authUser.role === "user" ? "history" : "pendingRequests");

/* ---------- CREATE REQUEST ---------- */
returnForm?.addEventListener("submit", e => {
  e.preventDefault();

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
    save();
    e.target.reset();
  };
  reader.readAsDataURL(evidence.files[0]);
});

/* ---------- CUSTOMER QUERY ---------- */
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
    save();
    e.target.reset();
  };

  if (file) reader.readAsDataURL(file);
  else reader.onload();
});

/* ---------- SORTING LOGIC FOR USER HISTORY ---------- */
function sortUserRequests(list) {
  const priority = {
    Pending: 1,
    Approved: 2,
    Rejected: 3
  };

  return list.sort((a, b) => {
    if (priority[a.status] !== priority[b.status]) {
      return priority[a.status] - priority[b.status];
    }
    return b.time - a.time; // latest first
  });
}

/* ---------- RENDER ---------- */
function render() {
  historyList.innerHTML = "";
  pendingList.innerHTML = "";
  refundList.innerHTML = "";
  queryList.innerHTML = "";

  historyList.className = "grid";
  pendingList.className = "grid";
  refundList.className = "grid";

  /* ---------- USER HISTORY ---------- */
  if (authUser.role === "user") {
    const userRequests = requests.filter(r => r.user === authUser.email);
    const sorted = sortUserRequests(userRequests);

    sorted.forEach(r => {
      historyList.appendChild(createCard(r));
    });
  }

  /* ---------- CS PENDING REQUESTS ---------- */
  if (authUser.role === "cs") {
    requests
      .filter(r => r.status === "Pending")
      .forEach(r => pendingList.appendChild(createCard(r)));
  }

  /* ---------- FINANCE REVIEWED ---------- */
  if (authUser.role === "finance") {
    requests
      .filter(r => r.status === "Reviewed")
      .forEach(r => {
        const card = createCard(r);
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

/* ---------- CARD BUILDER ---------- */
function createCard(r) {
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

/* ---------- FINANCE ACTIONS ---------- */
function approve(id) {
  const r = requests.find(x => x.id === id);
  r.status = "Approved";
  r.message = `Refund Initiated for Order #${r.orderId}. Amount will be credited within 5–7 working days.`;
  save();
}

function reject(id) {
  const r = requests.find(x => x.id === id);
  r.status = "Rejected";
  r.message = `Refund request for Order #${r.orderId} was rejected.`;
  save();
}

/* ---------- SAVE ---------- */
function save() {
  localStorage.setItem("requests", JSON.stringify(requests));
  localStorage.setItem("queries", JSON.stringify(queries));
  render();
}

/* ---------- LOGOUT ---------- */
function logout() {
  sessionStorage.clear();
  location.replace("login.html");
}

render();
