const authUser = JSON.parse(sessionStorage.getItem("authUser"));
if (!authUser) location.href = "login.html";

const roleTitle = document.getElementById("roleTitle");
roleTitle.innerText =
  authUser.role === "user" ? "User" :
  authUser.role === "cs" ? "Customer Service" : "Finance Admin";

let requests = JSON.parse(localStorage.getItem("requests")) || [];

function show(id) {
  document.querySelectorAll(".section").forEach(s => s.style.display = "none");
  document.getElementById(id).style.display = "block";
}

document.getElementById("userMenu").style.display =
  authUser.role === "user" ? "block" : "none";
document.getElementById("csMenu").style.display =
  authUser.role === "cs" ? "block" : "none";
document.getElementById("financeMenu").style.display =
  authUser.role === "finance" ? "block" : "none";

show(
  authUser.role === "user"
    ? "userSection"
    : authUser.role === "cs"
    ? "csSection"
    : "financeSection"
);

document.getElementById("requestForm")?.addEventListener("submit", e => {
  e.preventDefault();

  const reader = new FileReader();
  reader.onload = () => {
    requests.push({
      id: Date.now(),
      orderId: orderId.value,
      reason: reason.value,
      image: reader.result,
      status: "Pending",
      user: authUser.email
    });
    save();
    e.target.reset();
  };
  reader.readAsDataURL(evidence.files[0]);
});

function render() {
  userList.innerHTML = "";
  csList.innerHTML = "";
  financeList.innerHTML = "";

  requests.forEach(r => {
    const card = document.createElement("div");
    card.className = "card " + r.status.toLowerCase();
    card.innerHTML = `
      <b>${r.orderId}</b><br>
      ${r.reason}<br>
      Status: ${r.status}
      <img src="${r.image}">
    `;

    if (authUser.role === "user" && r.user === authUser.email)
      userList.appendChild(card);

    if (authUser.role === "cs" && r.status === "Pending") {
      card.innerHTML += `<button onclick="review(${r.id})">Mark Reviewed</button>`;
      csList.appendChild(card);
    }

    if (authUser.role === "finance" && r.status === "Reviewed") {
      card.innerHTML += `
        <button onclick="approve(${r.id})">Approve</button>
        <button onclick="reject(${r.id})">Reject</button>
      `;
      financeList.appendChild(card);
    }
  });
}

function review(id) {
  requests.find(r => r.id === id).status = "Reviewed";
  save();
}
function approve(id) {
  requests.find(r => r.id === id).status = "Approved";
  save();
}
function reject(id) {
  requests.find(r => r.id === id).status = "Rejected";
  save();
}

function save() {
  localStorage.setItem("requests", JSON.stringify(requests));
  render();
}

function logout() {
  sessionStorage.clear();
  location.href = "login.html";
}

render();
