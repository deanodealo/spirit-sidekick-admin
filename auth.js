// auth.js
import { auth, db } from './firebase-config.js';  // make sure firebase-config.js exports these correctly
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";
import {
  doc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";

// UI Handlers - show/hide login/register forms
window.showLogin = () => {
  document.getElementById("auth-forms").classList.remove("hidden");
  document.getElementById("login-form").classList.remove("hidden");
  document.getElementById("register-form").classList.add("hidden");
};

window.showRegister = () => {
  document.getElementById("auth-forms").classList.remove("hidden");
  document.getElementById("register-form").classList.remove("hidden");
  document.getElementById("login-form").classList.add("hidden");
};

// Register
const registerForm = document.getElementById("register-form");
if (registerForm) {
  registerForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("register-email").value;
    const password = document.getElementById("register-password").value;

    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        // Save user info to Firestore
        return setDoc(doc(db, "users", user.uid), {
          email: user.email,
          createdAt: serverTimestamp()
        });
      })
      .then(() => {
        window.location.href = "members.html";
      })
      .catch((err) => alert(err.message));
  });
}

// Login
const loginForm = document.getElementById("login-form");
if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        window.location.href = "members.html";
      })
      .catch((err) => alert(err.message));
  });
}

// Logout
document.addEventListener('DOMContentLoaded', () => {
  const logoutBtn = document.getElementById('logoutBtn');
  if (!logoutBtn) {
    console.log("Logout button not found on this page.");
    return;
  }
  logoutBtn.addEventListener('click', () => {
    console.log("Logout button clicked");
    signOut(auth)
      .then(() => {
        console.log("Successfully signed out");
        window.location.href = "index.html";
      })
      .catch((error) => {
        console.error("Logout error:", error);
        alert("Logout error: " + error.message);
      });
  });
});
