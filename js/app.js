/* ---------- AUTH CHECK ---------- */
const authUser = JSON.parse(sessionStorage.getItem("authUser"));
if (!authUser) window.location.replace("login.html");

/* ---------- ROLE TITLE ---------- */
const roleMap = {
  user: "User Dashboard",
  support: "Customer Support Dashboard",
  admin: "Admin Dashboard"
};
document.getElementById("roleTitle").innerText = roleMap[authUser.role];

/* ---------- ELEMENTS ---------- */
const returnForm = document.getElementById("returnForm");
const queryForm = document.getElementById("queryForm");

const userSection = document.getElementById("userSection");
const requestSection = document.getElementById("requestSection");

const pendingList = document.getElementById("pendingList");
const processedList = document.getElementById("processedList");
const queryList = document.getElementById("queryList");

let requests = JSON.parse(localStorage.getItem("requests")) || [];
let queries = JSON.parse(localStorage.getItem("queries")) || [];

/* ---------- VISIBILITY RULES ---------- */
if (authUser.role !== "user") userSection.style.display = "none";
if (authUser.role === "support") requestSection.style.display = "none";
if (authUser.role === "admin") document.getElementById("querySection").style.display = "none";

/* ---------- USER: SUBMIT RETURN (FIXED) ---------- */
returnForm?.addEventListener("submit", e => {
  e.preventDefault();

  const orderId = document.getElementById("orderId").value;
  const reason = document.getElementById("reason").value;
  const comment = document.getElementById("comment").value;
  const evidenceFile = document.getElementById("evidence").files[0];

  if (!orderId || !reason || !evidenceFile) {
    alert("Please fill all required fields and upload evidence.");
    return;
  }

  if (requests.some(r => r.orderId === orderId)) {
    alert("Duplicate Order ID detected");
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
      message: "",
      user: authUser.email,
      time: new Date().toISOString()
    });

    saveRequests();
    returnForm.reset();
  };

  reader.readAsDataURL(evidenceFile);
});

/* ---------- USER: SUBMIT QUERY ---------- */
queryForm?.addEventListener("submit", e => {
  e.preventDefault();

  const queryText = document.getElementById("queryText").value;
  if (!queryText) return;

  queries.push({
    id: crypto.randomUUID(),
    user: authUser.email,
    question: queryText,
    answer: "",
    status: "Pending",
    time: new Date().toISOString()
  });

  saveQueries();
  queryForm.reset();
});

/* ---------- SUPPORT: REPLY QUERY ---------- */
function replyQuery(id) {
  const q = queries.find(q => q.id === id);
  if (!q) return;

  const reply = document.getElementById(`reply-${id}`).value;
  if (!reply) return alert("Reply cannot be empty");

  q.answer = reply;
  q.status = "Answered";
  saveQueries();
}

/* ---------- ADMIN ACTIONS ---------- */
function approve(id) {
  const r = requests.find(r => r.id === id);
  if (!r) return;

  r.status = "Approved";
  r.message = `Refund Initiated for Order #${r.orderId}. The payment will be credited within 5–7 working days.`;
  saveRequests();
}

function reject(id) {
  const r = requests.find(r => r.id === id);
  if (!r) return;

  r.status = "Rejected";
  r.message = `Refund request rejected. Please contact customer support.`;
  saveRequests();
}

/* ---------- RENDER ---------- */
function render() {
  pendingList.innerHTML = "";
  processedList.innerHTML = "";
  queryList.innerHTML = "";

  requests.forEach(r => {
    if (authUser.role === "user" && r.user !== authUser.email) return;

    const li = document.createElement("li");
    li.className = r.status.toLowerCase();

    li.innerHTML = `
      <strong>Order ID:</strong> ${r.orderId}<br>
      <strong>Status:</strong> ${r.status}<br>
      ${authUser.role === "user" && r.message ? `<div class="notification">${r.message}</div>` : ""}
      <img src="${r.evidence}" />

      ${
        authUser.role === "admin" && r.status === "Pending"
          ? `<button onclick="approve('${r.id}')">Approve</button>
             <button onclick="reject('${r.id}')">Reject</button>`
          : ""
      }
    `;

    (r.status === "Pending" ? pendingList : processedList).appendChild(li);
  });

  queries.forEach(q => {
    if (authUser.role === "user" && q.user !== authUser.email) return;

    const li = document.createElement("li");
    li.className = q.status === "Answered" ? "answered" : "pending";

    li.innerHTML = `
      <strong>Query:</strong> ${q.question}<br>
      <strong>Status:</strong> ${q.status}<br>
      ${q.answer ? `<div class="reply">${q.answer}</div>` : ""}
      ${
        authUser.role === "support" && q.status === "Pending"
          ? `<textarea id="reply-${q.id}"></textarea>
             <button onclick="replyQuery('${q.id}')">Reply</button>`
          : ""
      }
    `;

    queryList.appendChild(li);
  });
}

/* ---------- STORAGE ---------- */
function saveRequests() {
  localStorage.setItem("requests", JSON.stringify(requests));
  render();
}

function saveQueries() {
  localStorage.setItem("queries", JSON.stringify(queries));
  render();
}

/* ---------- LOGOUT ---------- */
function logout() {
  sessionStorage.clear();
  window.location.replace("login.html");
}

/* ---------- INITIAL RENDER ---------- */
render();
