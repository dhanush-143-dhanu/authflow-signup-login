const tabs = document.querySelectorAll(".tab");
const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");
const dashboard = document.getElementById("dashboard");
const message = document.getElementById("message");

function showMessage(text, type = "success") {
  message.textContent = text;
  message.className = `message ${type}`;
}

function clearMessage() {
  message.className = "message hidden";
}

function showAuth(view) {
  dashboard.classList.add("hidden");
  loginForm.classList.toggle("hidden", view !== "login");
  signupForm.classList.toggle("hidden", view !== "signup");
  tabs.forEach(tab => tab.classList.toggle("active", tab.dataset.view === view));
  clearMessage();
}

tabs.forEach(tab => {
  tab.addEventListener("click", () => showAuth(tab.dataset.view));
});

async function request(url, options = {}) {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Something went wrong.");
  return data;
}

loginForm.addEventListener("submit", async e => {
  e.preventDefault();
  try {
    const data = await request("/api/login", {
      method: "POST",
      body: JSON.stringify({
        email: loginEmail.value,
        password: loginPassword.value
      })
    });
    loginForm.reset();
    showDashboard(data.user);
  } catch (err) {
    showMessage(err.message, "error");
  }
});

signupForm.addEventListener("submit", async e => {
  e.preventDefault();
  try {
    const data = await request("/api/signup", {
      method: "POST",
      body: JSON.stringify({
        name: signupName.value,
        email: signupEmail.value,
        password: signupPassword.value
      })
    });
    signupForm.reset();
    showDashboard(data.user);
  } catch (err) {
    showMessage(err.message, "error");
  }
});

async function showDashboard(user) {
  loginForm.classList.add("hidden");
  signupForm.classList.add("hidden");
  document.querySelector(".tabs").classList.add("hidden");
  message.classList.add("hidden");
  dashboard.classList.remove("hidden");

  document.getElementById("avatar").textContent = user.name.charAt(0).toUpperCase();
  document.getElementById("welcome").textContent = `Welcome, ${user.name}!`;
  document.getElementById("accountEmail").textContent = user.email;

  try {
    const data = await request("/api/protected");
    document.getElementById("protectedText").textContent = data.message;
  } catch (err) {
    document.getElementById("protectedText").textContent = err.message;
  }
}

document.getElementById("logoutBtn").addEventListener("click", async () => {
  await request("/api/logout", { method: "POST" });
  document.querySelector(".tabs").classList.remove("hidden");
  showAuth("login");
  showMessage("You have been logged out.", "success");
});

(async function restoreSession() {
  try {
    const data = await request("/api/me");
    showDashboard(data.user);
  } catch {
    showAuth("login");
  }
})();