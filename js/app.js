const authUser = JSON.parse(sessionStorage.getItem("authUser"));
if (!authUser) window.location.replace("login.html");

document.getElementById("roleTitle").innerText =
  authUser.role === "support"
    ? "Customer Support Dashboard"
    : authUser.role === "admin"
    ? "Admin Dashboard"
    : "User Dashboard";

const userSection = document.getElementById("userSection");
const supportSection = document.getElementById("supportSection");
const querySection = document.getElementById("querySection");
const requestView = document.getElementById("requestView");

let requests = JSON.parse(localStorage.getItem("requests")) || [];
let queries = JSON.parse(localStorage.getItem("queries")) || [];

/* Role-based visibility */
if (authUser.role === "user") {
  supportSection.style.display = "none";
}
if (authUser.role === "admin") {
  userSection.style.display = "none";
  querySection.style.display = "none";
  supportSection.style.display = "none";
}
if (authUser.role === "support") {
  userSection.style.display = "none";
  querySection.style.display = "none";
}

/* ---------- SUPPORT QUERY SUBMISSION ---------- */
document.getElementById("queryForm")?.addEventListener("submit", e => {
  e.preventDefault();

  const text = document.getElementById("queryText").value;

  queries.push({
    id: crypto.randomUUID(),
    user: authUser.email,
    text,
    response: "",
    status: "Pending",
    time: new Date().toISOString()
  });

  saveQueries();
  e.target.reset();
});

/* ---------- RENDER QUERIES ---------- */
function renderQueries() {
  const pending = document.getElementById("pendingQueries");
  const answered = document.getElementById("answeredQueries");
  if (!pending || !answered) return;

  pending.innerHTML = "";
  answered.innerHTML = "";

  queries.forEach(q => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${q.user}</strong><br>
      ${q.text}
      ${
        authUser.role === "support" && q.status === "Pending"
          ? `<br>
             <textarea placeholder="Response" id="resp-${q.id}"></textarea>
             <button onclick="answerQuery('${q.id}')">Mark Answered</button>`
          : ""
      }
      ${
        q.status === "Answered"
          ? `<div class="notification">Response: ${q.response}</div>`
          : ""
      }
    `;

    q.status === "Pending"
      ? pending.appendChild(li)
      : answered.appendChild(li);
  });
}

function answerQuery(id) {
  const q = queries.find(x => x.id === id);
  const resp = document.getElementById(`resp-${id}`).value;
  if (!q || !resp) return;

  q.response = resp;
  q.status = "Answered";
  saveQueries();
}

function saveQueries() {
  localStorage.setItem("queries", JSON.stringify(queries));
  renderQueries();
}

renderQueries();

/* ---------- LOGOUT ---------- */
function logout() {
  sessionStorage.clear();
  window.location.replace("login.html");
}
