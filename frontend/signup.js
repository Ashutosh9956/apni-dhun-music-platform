const signupForm = document.getElementById("signup-form");
const signupPassword = document.getElementById("signup-password");
const confirmPassword = document.getElementById("signup-confirm-password");
const signupStatus = document.getElementById("signup-status");

// Auto-route to port 3000 if opened through VS Code Live Server (port 5500), preview, etc.
const API_BASE = window.location.port === "3000" ? "" : "http://localhost:3000";

document.querySelectorAll("[data-password-toggle]").forEach(button => {
  button.addEventListener("click", () => {
    const input = document.getElementById(button.dataset.passwordToggle);
    const isVisible = input.type === "text";
    input.type = isVisible ? "password" : "text";
    button.textContent = isVisible ? "Show" : "Hide";
    button.setAttribute(
      "aria-label",
      `${isVisible ? "Show" : "Hide"} ${input.labels[0].textContent.toLowerCase()}`
    );
    button.setAttribute("aria-pressed", String(!isVisible));
  });
});

signupForm.addEventListener("submit", async event => {
  event.preventDefault();
  signupStatus.textContent = "";

  if (signupPassword.value !== confirmPassword.value) {
    signupStatus.textContent = "Those passwords don't match. Please check and try again.";
    confirmPassword.focus();
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        name: signupForm.elements.name.value,
        email: signupForm.elements.email.value,
        password: signupPassword.value
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
      if (response.status === 409) {
        throw new Error("An account with that email already exists.");
      }
      if (response.status === 429) {
        throw new Error("Too many attempts. Please wait a few moments and try again.");
      }
      throw new Error(`Account creation failed (Status ${response.status}).`);
    }

    // Redirect to home page
    window.location.assign(window.location.port === "3000" ? "index.html" : "http://localhost:3000/index.html");
  } catch (error) {
    signupStatus.textContent = error.message === "Failed to fetch"
      ? "Could not connect to the backend server. Please run 'node server.js' and open http://localhost:3000."
      : error.message;
  }
});
