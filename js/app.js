/* ---------- AUTH ---------- */
const authUser = JSON.parse(sessionStorage.getItem("authUser"));
if (!authUser) location.replace("login.html");

/* ---------- ROLE TITLE ---------- */
const titles = {
  user: "User Dashboard",
  cs: "Customer Service Dashboard",
  finance: "Finance Admin Dashboard"
};
document.getElementById("roleTitle").innerText = titles[authUser.role];

/* ---------- STORAGE ---------- */
let requests = JSON.parse(localStorage.getItem("requests")) || [];
let queries = JSON.parse(localStorage.getItem("queries")) || [];

/* ---------- MENU CONTROL ---------- */
function showSection(id) {
  document.querySelectorAll(".section").forEach(s => s.style.display = "none");
  document.getElementById(id).style.display = "block";
}

/* ---------- MENU VISIBILITY ---------- */
const hide = id => document.getElementById(id).style.display = "none";

if (authUser.role === "user") {
  hide("menuPending");
  hide("menuQueries");
  hide("menuRefunds");
} else if (authUser.role === "cs") {
  hide("menuCreate");
  hide("menuSupport");
} else if (authUser.role === "finance") {
  hide("menuCreate");
  hide("menuSupport");
  hide("menuQueries");
}

showSection("history");

/* ---------- CREATE REQUEST ---------- */
document.getElementById("returnForm")?.addEventListener("submit", e => {
  e.preventDefault();

  const reader = new FileReader();
  const file = evidence.files[0];

  reader.onload = () => {
    requests.push({
      id: crypto.randomUUID(),
      orderId: orderId.value,
      reason: reason.value,
      comment: comment.value,
      evidence: reader.result || "",
      status: "Pending",
      user: authUser.email,
      message: ""
    });
    save();
    e.target.reset();
  };

  if (file) reader.readAsDataURL(file);
  else reader.onload();
});

/* ---------- CUSTOMER QUERY ---------- */
document.getElementById("queryForm")?.addEventListener("submit", e => {
  e.preventDefault();

  const reader = new FileReader();
  const file = queryImage.files[0];

  reader.onload = () => {
    queries.push({
      id: crypto.randomUUID(),
      text: queryText.value,
      image: reader.result || "",
      user: authUser.email,
      time: new Date().toISOString()
    });
    save();
    e.target.reset();
  };

  if (file) reader.readAsDataURL(file);
  else reader.onload();
});

/* ---------- RENDER ---------- */
function render() {
  historyList.innerHTML = "";
  pendingList.innerHTML = "";
  refundList.innerHTML = "";
  queryList.innerHTML = "";

  requests.forEach(r => {
    if (authUser.role === "user" && r.user !== authUser.email) return;

    const li = document.createElement("li");
    li.innerHTML = `
      <b>${r.orderId}</b> | ${r.status}
      ${r.message ? `<div class="notification">${r.message}</div>` : ""}
    `;

    historyList.appendChild(li);

    if (r.status === "Pending" && authUser.role !== "user") {
      pendingList.appendChild(li.cloneNode(true));
    }

    if (authUser.role === "finance" && r.status === "Reviewed") {
      const fli = li.cloneNode(true);
      fli.innerHTML += `
        <button onclick="approve('${r.id}')">Approve</button>
        <button onclick="reject('${r.id}')">Reject</button>`;
      refundList.appendChild(fli);
    }
  });

  queries.forEach(q => {
    if (authUser.role === "user" && q.user !== authUser.email) return;

    const li = document.createElement("li");
    li.innerHTML = `${q.text}`;
    queryList.appendChild(li);
  });
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
  r.message = `Refund rejected for Order #${r.orderId}.`;
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
