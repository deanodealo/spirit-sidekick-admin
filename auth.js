import { auth, db } from './firebase-config.js';  // Make sure firebase-config.js exports auth and db correctly
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  doc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {

  // Set auth persistence to local (store session in browser local storage)
  setPersistence(auth, browserLocalPersistence)
    .then(() => {
      console.log("Auth persistence set to local (browserLocalPersistence)");
      alert("Auth persistence set to local");
    })
    .catch((err) => {
      console.error("Error setting auth persistence:", err);
      alert("Error setting auth persistence: " + err.message);
    });

  // Helper to scroll to auth forms and focus first input of visible form
  function scrollToAuthForms() {
    const forms = document.getElementById('auth-forms');
    if (forms) {
      forms.scrollIntoView({ behavior: 'smooth', block: 'start' });

      setTimeout(() => {
        const visibleForm = forms.querySelector('form:not(.hidden)');
        if (visibleForm) {
          const firstInput = visibleForm.querySelector('input');
          if (firstInput) firstInput.focus();
        }
      }, 500);
    }
  }

  // UI Handlers - show/hide login/register forms
  window.showLogin = () => {
    console.log("Showing login form");
    document.getElementById("auth-forms").classList.remove("hidden");
    document.getElementById("login-form").classList.remove("hidden");
    document.getElementById("register-form").classList.add("hidden");

    scrollToAuthForms();
  };

  window.showRegister = () => {
    console.log("Showing register form");
    document.getElementById("auth-forms").classList.remove("hidden");
    document.getElementById("register-form").classList.remove("hidden");
    document.getElementById("login-form").classList.add("hidden");

    scrollToAuthForms();
  };

  // Register new users
  const registerForm = document.getElementById("register-form");
  if (registerForm) {
    registerForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = document.getElementById("register-email").value;
      const password = document.getElementById("register-password").value;

      console.log("Register form submitted", email);

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
          console.log("Registration successful, redirecting to members.html");
          alert("Registration successful!");
          window.location.href = "members.html"; // New users go directly to members area
        })
        .catch((err) => {
          console.error("Registration error:", err);
          alert(err.message);
        });
    });
  }

  // Login existing users (no redirect to members.html)
  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = document.getElementById("login-email").value;
      const password = document.getElementById("login-password").value;

      alert("Login form submitted");
      console.log("Login form submitted");
      alert("Email entered: " + email);
      console.log("Email entered:", email);

      signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          alert("Login successful: " + userCredential.user.email);
          console.log("Login successful:", userCredential.user.email);

          // Detect mobile devices and reload page to force UI update
          if (/Mobi|Android/i.test(navigator.userAgent)) {
            alert("Mobile device detected — reloading page to update UI");
            window.location.reload();
          }
          // else desktop: no reload, UI updates via onAuthStateChanged
        })
        .catch((err) => {
          console.error("Login error:", err);
          alert("Login error: " + err.message);
        });
    });
  }

  // Persistent login state handling and UI update
  onAuthStateChanged(auth, (user) => {
    console.log("onAuthStateChanged fired", user);
    if (user) {
      // User logged in
      if (
        window.location.pathname.endsWith("index.html") ||
        window.location.pathname === "/" ||
        window.location.pathname === "/index.html"
      ) {
        showLoggedInUI(user);
      }
      // If on members page, no action needed (user can stay)
    } else {
      // User logged out
      if (window.location.pathname.endsWith("members.html")) {
        window.location.href = "index.html"; // Redirect to login if on members page
      } else {
        showLoggedOutUI();
      }
    }
  });

  // UI updates based on login state
  function showLoggedInUI(user) {
    // Hide login/register buttons and auth forms
    const authButtons = document.querySelector('.auth-buttons');
    if (authButtons) authButtons.style.display = 'none';

    const authForms = document.getElementById('auth-forms');
    if (authForms) authForms.classList.add('hidden');

    // Show logged-in section (welcome + logout)
    const loggedInSection = document.getElementById('logged-in-section');
    if (loggedInSection) loggedInSection.style.display = 'block';

    // Show welcome message with user's email
    let welcome = document.getElementById('welcomeMsg');
    if (!welcome) {
      welcome = document.createElement('p');
      welcome.id = 'welcomeMsg';
      welcome.style.textAlign = 'center';
      welcome.style.marginTop = '1rem';
      document.querySelector('.home-container').prepend(welcome);
    }
    welcome.textContent = `Welcome, ${user.email}`;

    // Add Members link to burger menu if not present
    const sideMenu = document.getElementById('sideMenu');
    if (sideMenu && !document.getElementById('membersMenuItem')) {
      const li = document.createElement('li');
      li.id = 'membersMenuItem';
      const a = document.createElement('a');
      a.href = 'members.html';
      a.textContent = 'Members';
      li.appendChild(a);
      sideMenu.querySelector('ul').appendChild(li);
    }
  }

  function showLoggedOutUI() {
    // Show login/register buttons
    const authButtons = document.querySelector('.auth-buttons');
    if (authButtons) authButtons.style.display = 'block';

    // Hide auth forms container (add hidden class)
    const authForms = document.getElementById('auth-forms');
    if (authForms) authForms.classList.add('hidden');

    // Hide logged-in section
    const loggedInSection = document.getElementById('logged-in-section');
    if (loggedInSection) loggedInSection.style.display = 'none';

    // Remove welcome message
    const welcome = document.getElementById('welcomeMsg');
    if (welcome) welcome.remove();

    // Remove Members link from burger menu if present
    const membersItem = document.getElementById('membersMenuItem');
    if (membersItem) membersItem.remove();
  }

  // Logout button logic
  const logoutBtn = document.getElementById('logoutBtn');
  if (!logoutBtn) {
    console.log("Logout button not found on this page.");
  } else {
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
  }

}); // end DOMContentLoaded
