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
    .catch(() => {
      // Optional: handle persistence errors silently or show minimal alert if needed
      alert("Error setting auth persistence.");
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
    document.getElementById("auth-forms").classList.remove("hidden");
    document.getElementById("login-form").classList.remove("hidden");
    document.getElementById("register-form").classList.add("hidden");
    scrollToAuthForms();
  };

  window.showRegister = () => {
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
          window.location.href = "members.html"; // New users go directly to members area
        })
        .catch((err) => {
          alert(err.message);  // Keep alerts only for errors
        });
    });
  }

// Login existing users (redirect to members.html)
const loginForm = document.getElementById("login-form");
if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        // Redirect to members area after successful login
        window.location.href = "members.html";
      })
      .catch((err) => {
        alert("Login error: " + err.message);
      });
  });
}


  // Persistent login state handling and UI update
  onAuthStateChanged(auth, (user) => {
    if (user) {
      if (
        window.location.pathname.endsWith("index.html") ||
        window.location.pathname === "/" ||
        window.location.pathname === "/index.html"
      ) {
        showLoggedInUI(user);
      }
      // No redirect needed if already on members page
    } else {
      if (window.location.pathname.endsWith("members.html")) {
        window.location.href = "index.html"; // Redirect logged out users from members page
      } else {
        showLoggedOutUI();
      }
    }
  });

  // UI updates based on login state
  function showLoggedInUI(user) {
    const authButtons = document.querySelector('.auth-buttons');
    if (authButtons) authButtons.style.display = 'none';

    const authForms = document.getElementById('auth-forms');
    if (authForms) authForms.classList.add('hidden');

    const loggedInSection = document.getElementById('logged-in-section');
    if (loggedInSection) loggedInSection.style.display = 'block';

    let welcome = document.getElementById('welcomeMsg');
    if (!welcome) {
      welcome = document.createElement('p');
      welcome.id = 'welcomeMsg';
      welcome.style.textAlign = 'center';
      welcome.style.marginTop = '1rem';
      document.querySelector('.home-container').prepend(welcome);
    }
    welcome.textContent = `Welcome, ${user.email}`;

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
    const authButtons = document.querySelector('.auth-buttons');
    if (authButtons) authButtons.style.display = 'block';

    const authForms = document.getElementById('auth-forms');
    if (authForms) authForms.classList.add('hidden');

    const loggedInSection = document.getElementById('logged-in-section');
    if (loggedInSection) loggedInSection.style.display = 'none';

    const welcome = document.getElementById('welcomeMsg');
    if (welcome) welcome.remove();

    const membersItem = document.getElementById('membersMenuItem');
    if (membersItem) membersItem.remove();
  }

  // Logout button logic
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      signOut(auth)
        .then(() => {
          window.location.href = "index.html";
        })
        .catch((error) => {
          alert("Logout error: " + error.message);  // Only alert on logout errors
        });
    });
  }

}); // end DOMContentLoaded
