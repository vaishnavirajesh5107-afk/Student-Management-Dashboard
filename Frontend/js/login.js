const API_BASE = "http://127.0.0.1:5000/api";
document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#loginForm");
  if (!form) return;
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const message = document.querySelector("#loginMessage");
    const button = form.querySelector("button[type=submit]");
    message.textContent = "";
    button.disabled = true;
    button.textContent = "Signing in...";
    try {
      const response = await fetch(`${API_BASE}/login`, {
        method: "POST", headers: {"Content-Type":"application/json"},
        body: JSON.stringify({
          register_no: document.querySelector("#registerNo").value.trim(),
          password: document.querySelector("#password").value
        })
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || "Login failed.");
      localStorage.setItem("studentRegisterNo", result.data.token);
      localStorage.setItem("studentName", result.data.student.name);
      window.location.href = "dashboard.html";
    } catch (error) {
      message.textContent = error.message || "Cannot connect to backend. Start the Flask server first.";
      message.className = "alert";
    } finally {
      button.disabled = false;
      button.textContent = "Sign in to dashboard";
    }
  });
});