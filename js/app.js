const authUser = JSON.parse(sessionStorage.getItem("authUser"));
if (!authUser) window.location.href = "login.html";

document.getElementById("roleTitle").innerText =
  authUser.role === "user" ? "User Dashboard" : "Admin Dashboard";

const userSection = document.getElementById("userSection");
const adminSection = document.getElementById("adminSection");

userSection.style.display = authUser.role === "user" ? "block" : "none";
adminSection.style.display = authUser.role === "admin" ? "block" : "none";

let requests = JSON.parse(localStorage.getItem("requests")) || [];

/* USER SUBMIT REQUEST */
document.getElementById("requestForm")?.addEventListener("submit", function (e) {
  e.preventDefault();

  const reader = new FileReader();
  reader.onload = () => {
    requests.push({
      id: Date.now(),
      orderId: orderId.value,
      reason: reason.value,
      evidence: reader.result,
      status: "Pending",
      user: authUser.email
    });
    save();
    e.target.reset();
  };
  reader.readAsDataURL(evidence.files[0]);
});

/* RENDER */
function render() {
  userList.innerHTML = "";
  adminList.innerHTML = "";

  requests.forEach(r => {
    const card = document.createElement("div");
    card.className = "card " + r.status.toLowerCase();
    card.innerHTML = `
      <b>Order:</b> ${r.orderId}<br>
      <b>Reason:</b> ${r.reason}<br>
      <b>Status:</b> ${r.status}
      <img src="${r.evidence}">
    `;

    if (authUser.role === "user" && r.user === authUser.email) {
      userList.appendChild(card);
    }

    if (authUser.role === "admin") {
      card.innerHTML += `
        <button onclick="approve(${r.id})">Approve</button>
        <button onclick="reject(${r.id})">Reject</button>
      `;
      adminList.appendChild(card);
    }
  });
}

/* ADMIN ACTIONS */
function approve(id) {
  const r = requests.find(x => x.id === id);
  r.status = "Approved";
  save();
}

function reject(id) {
  const r = requests.find(x => x.id === id);
  r.status = "Rejected";
  save();
}

function save() {
  localStorage.setItem("requests", JSON.stringify(requests));
  render();
}

function logout() {
  sessionStorage.clear();
  window.location.href = "login.html";
}

render();
