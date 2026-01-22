const authUser = JSON.parse(sessionStorage.getItem("authUser"));
if (!authUser) location.replace("login.html");

const roleTitle = {
  user: "User Dashboard",
  cs: "Customer Service Dashboard",
  finance: "Finance Admin Dashboard"
};
document.getElementById("roleTitle").innerText = roleTitle[authUser.role];

let requests = JSON.parse(localStorage.getItem("requests")) || [];
let queries = JSON.parse(localStorage.getItem("queries")) || [];

/* MENU VISIBILITY */
menuUser.style.display = authUser.role === "user" ? "block" : "none";
menuCS.style.display = authUser.role === "cs" ? "block" : "none";
menuFinance.style.display = authUser.role === "finance" ? "block" : "none";

/* SECTION CONTROL */
function showSection(id) {
  document.querySelectorAll(".section").forEach(s => s.style.display = "none");
  document.getElementById(id).style.display = "block";
}

showSection(authUser.role === "user" ? "history" : "pendingRequests");

/* CREATE REQUEST (USER) */
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
      message: ""
    });
    save();
    e.target.reset();
  };
  reader.readAsDataURL(evidence.files[0]);
});

/* CUSTOMER QUERY (EVIDENCE OPTIONAL) */
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
      status: "Open"
    });
    save();
    e.target.reset();
  };

  if (file) reader.readAsDataURL(file);
  else reader.onload();
});

/* RENDER */
function render() {
  historyList.innerHTML = "";
  pendingList.innerHTML = "";
  refundList.innerHTML = "";
  queryList.innerHTML = "";

  requests.forEach(r => {
    if (authUser.role === "user" && r.user !== authUser.email) return;

    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <b>Order ID:</b> ${r.orderId}<br>
      <b>Reason:</b> ${r.reason}<br>
      <b>Comment:</b> ${r.comment}<br>
      <b>Status:</b> ${r.status}
      ${r.message ? `<div class="notification">${r.message}</div>` : ""}
      <img src="${r.evidence}">
    `;

    historyList.appendChild(card.cloneNode(true));

    if (authUser.role === "cs" && r.status === "Pending") {
      pendingList.appendChild(card.cloneNode(true));
    }

    if (authUser.role === "finance" && r.status === "Reviewed") {
      const fcard = card.cloneNode(true);
      fcard.innerHTML += `
        <button onclick="approve('${r.id}')">Approve</button>
        <button onclick="reject('${r.id}')">Reject</button>
      `;
      refundList.appendChild(fcard);
    }
  });

  /* QUERIES — FIXED */
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

/* FINANCE ACTIONS */
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

/* SAVE */
function save() {
  localStorage.setItem("requests", JSON.stringify(requests));
  localStorage.setItem("queries", JSON.stringify(queries));
  render();
}

function logout() {
  sessionStorage.clear();
  location.replace("login.html");
}

render();
