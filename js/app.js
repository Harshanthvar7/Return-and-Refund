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

/* ---------- USER: SUBMIT RETURN ---------- */
returnForm?.addEventListener("submit", e => {
  e.preventDefault();

  const orderId = orderIdInput.value;
  if (requests.some(r => r.orderId === orderId)) {
    alert("Duplicate Order ID detected");
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    requests.push({
      id: crypto.randomUUID(),
      orderId,
      reason: reason.value,
      comment: comment.value,
      evidence: reader.result,
      status: "Pending",
      message: "",
      user: authUser.email
    });
    saveRequests();
    returnForm.reset();
  };
  reader.readAsDataURL(evidence.files[0]);
});

/* ---------- USER: SUBMIT QUERY ---------- */
queryForm?.addEventListener("submit", e => {
  e.preventDefault();

  queries.push({
    id: crypto.randomUUID(),
    user: authUser.email,
    question: queryText.value,
    answer: "",
    status: "Pending"
  });
  saveQueries();
  queryForm.reset();
});

/* ---------- SUPPORT: REPLY QUERY ---------- */
function replyQuery(id) {
  const q = queries.find(q => q.id === id);
  q.answer = document.getElementById(`reply-${id}`).value;
  q.status = "Answered";
  saveQueries();
}

/* ---------- ADMIN ACTIONS ---------- */
function approve(id) {
  const r = requests.find(r => r.id === id);
  r.status = "Approved";
  r.message = `Refund Initiated for Order #${r.orderId}. The payment will be credited within 5–7 working days.`;
  saveRequests();
}

function reject(id) {
  const r = requests.find(r => r.id === id);
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
      <b>Order:</b> ${r.orderId}<br>
      <b>Status:</b> ${r.status}<br>
      ${authUser.role === "user" && r.message ? `<div class="notification">${r.message}</div>` : ""}
      <img src="${r.evidence}">
      ${authUser.role === "admin" && r.status === "Pending" ? `
        <button onclick="approve('${r.id}')">Approve</button>
        <button onclick="reject('${r.id}')">Reject</button>` : ""}
    `;
    (r.status === "Pending" ? pendingList : processedList).appendChild(li);
  });

  queries.forEach(q => {
    if (authUser.role === "user" && q.user !== authUser.email) return;
    const li = document.createElement("li");
    li.className = q.status === "Answered" ? "answered" : "pending";
    li.innerHTML = `
      <b>Query:</b> ${q.question}<br>
      <b>Status:</b> ${q.status}<br>
      ${q.answer ? `<div class="reply">${q.answer}</div>` : ""}
      ${authUser.role === "support" && q.status === "Pending" ? `
        <textarea id="reply-${q.id}"></textarea>
        <button onclick="replyQuery('${q.id}')">Reply</button>` : ""}
    `;
    queryList.appendChild(li);
  });
}

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

render();
