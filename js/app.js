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
const userSection = document.getElementById("userSection");
const requestView = document.getElementById("requestView");
const supportSection = document.getElementById("supportSection");
const querySection = document.getElementById("querySection");

const returnForm = document.getElementById("returnForm");
const queryForm = document.getElementById("queryForm");

const pendingList = document.getElementById("pendingList");
const processedList = document.getElementById("processedList");

const queryList = document.getElementById("queryList");
const supportQueryList = document.getElementById("supportQueryList");

let requests = JSON.parse(localStorage.getItem("requests")) || [];
let queries = JSON.parse(localStorage.getItem("queries")) || [];

/* ---------- ROLE VISIBILITY ---------- */
userSection.style.display = authUser.role === "user" ? "block" : "none";
querySection.style.display = authUser.role === "user" ? "block" : "none";
requestView.style.display = authUser.role === "admin" ? "block" : "none";
supportSection.style.display = authUser.role === "support" ? "block" : "none";

/* ---------- USER: SUBMIT RETURN ---------- */
returnForm?.addEventListener("submit", e => {
  e.preventDefault();

  const orderId = orderId.value;
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
      evidence: evidence.files[0] ? reader.result : "",
      status: "Pending",
      message: "",
      user: authUser.email,
      time: new Date().toISOString()
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
    text: queryText.value,
    reply: "",
    status: "Pending",
    user: authUser.email,
    time: new Date().toISOString()
  });

  saveQueries();
  queryForm.reset();
});

/* ---------- SUPPORT: REPLY ---------- */
function replyQuery(id) {
  const q = queries.find(q => q.id === id);
  if (!q) return;

  const reply = document.getElementById(`reply-${id}`).value;
  if (!reply) return alert("Reply cannot be empty");

  q.reply = reply;
  q.status = "Answered";
  saveQueries();
}

/* ---------- RENDER ---------- */
function render() {
  // USER QUERIES
  queryList.innerHTML = "";
  queries.filter(q => q.user === authUser.email).forEach(q => {
    queryList.innerHTML += `
      <li class="${q.status.toLowerCase()}">
        <strong>Query:</strong> ${q.text}<br>
        <strong>Status:</strong> ${q.status}<br>
        ${q.reply ? `<div class="notification">${q.reply}</div>` : ""}
      </li>`;
  });

  // SUPPORT VIEW
  supportQueryList.innerHTML = "";
  queries.forEach(q => {
    supportQueryList.innerHTML += `
      <li class="${q.status.toLowerCase()}">
        <strong>User:</strong> ${q.user}<br>
        <strong>Query:</strong> ${q.text}<br>
        <strong>Status:</strong> ${q.status}<br>
        ${
          q.status === "Pending"
            ? `<textarea id="reply-${q.id}" placeholder="Reply..."></textarea>
               <button onclick="replyQuery('${q.id}')">Send Reply</button>`
            : `<div class="notification">Reply sent</div>`
        }
      </li>`;
  });

  // ADMIN REQUESTS (unchanged)
  pendingList.innerHTML = "";
  processedList.innerHTML = "";
  requests.forEach(r => {
    const li = document.createElement("li");
    li.className = r.status.toLowerCase();
    li.innerHTML = `<strong>${r.orderId}</strong> - ${r.status}`;
    (r.status === "Pending" ? pendingList : processedList).appendChild(li);
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
