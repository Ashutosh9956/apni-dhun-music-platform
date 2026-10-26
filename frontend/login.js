const loginForm = document.getElementById("login-form");
const passwordInput = document.getElementById("login-password");
const passwordToggle = document.getElementById("password-toggle");
const forgotPasswordButton = document.getElementById("forgot-password");
const loginStatus = document.getElementById("login-status");

// Auto-route to port 3000 if opened through VS Code Live Server (port 5500), preview, etc.
const API_BASE = window.location.port === "3000" ? "" : "http://localhost:3000";

passwordToggle.addEventListener("click", () => {
  const isVisible = passwordInput.type === "text";
  passwordInput.type = isVisible ? "password" : "text";
  passwordToggle.textContent = isVisible ? "Show" : "Hide";
  passwordToggle.setAttribute("aria-label", isVisible ? "Show password" : "Hide password");
  passwordToggle.setAttribute("aria-pressed", String(!isVisible));
});

loginForm.addEventListener("submit", async event => {
  event.preventDefault();
  loginStatus.textContent = "";

  try {
    const response = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        email: loginForm.elements.email.value,
        password: passwordInput.value,
        remember: loginForm.elements.remember.checked
      })
    });
    const contentType = response.headers.get("content-type") || "";
    const isJson = contentType.includes("application/json");
    const result = isJson ? await response.json() : {};

    if (!response.ok) {
      if (result && result.error) throw new Error(result.error);
      if (response.status === 404) {
        throw new Error(
          "Could not reach backend API (404 Not Found). Please make sure the Node.js server is running and access the site at http://localhost:3000."
        );
      }
      throw new Error(`Sign-in failed (${response.status}).`);
    }
    window.location.assign(window.location.port === "3000" ? "index.html" : "http://localhost:3000/index.html");
  } catch (error) {
    loginStatus.textContent = error.message === "Failed to fetch"
      ? "Could not connect to the backend server. Please run 'node server.js' and open http://localhost:3000."
      : error.message;
  }
});

forgotPasswordButton.addEventListener("click", async () => {
  const email = window.prompt("Enter your account email to reset your password:", loginForm.elements.email.value || "");
  if (!email || !email.trim()) return;

  loginStatus.textContent = "Requesting password reset...";
  try {
    const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email: email.trim() })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Reset request failed.");

    if (data.resetToken) {
      const newPassword = window.prompt("Enter your new password (minimum 8 characters):");
      if (!newPassword) {
        loginStatus.textContent = "Password reset cancelled.";
        return;
      }
      const resetRes = await fetch(`${API_BASE}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ token: data.resetToken, password: newPassword })
      });
      const resetData = await resetRes.json();
      if (!resetRes.ok) throw new Error(resetData.error || "Reset failed.");
      loginStatus.textContent = "Password reset successful! Please sign in with your new password.";
    } else {
      loginStatus.textContent = data.message || "Password reset instructions sent.";
    }
  } catch (err) {
    loginStatus.textContent = err.message;
  }
});
