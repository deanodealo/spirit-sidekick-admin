import { auth, db } from './firebase-config.js';  // Make sure firebase-config.js exports auth and db correctly
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  updateProfile
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

  // Register new users (updated to capture name)
  const registerForm = document.getElementById("register-form");
  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const name = document.getElementById("register-name").value.trim();
      const email = document.getElementById("register-email").value;
      const password = document.getElementById("register-password").value;

      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Update Firebase Auth profile with displayName
        await updateProfile(user, { displayName: name });

        // Save user info to Firestore including name
        await setDoc(doc(db, "users", user.uid), {
          name: name,
          email: user.email,
          createdAt: serverTimestamp()
        });

        window.location.href = "members.html"; // New users go directly to members area
      } catch (err) {
        alert(err.message);
      }
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
      // Show logged-in UI on any page
      showLoggedInUI(user);
    } else {
      // Redirect logged out users away from members.html
      if (window.location.pathname.endsWith("members.html")) {
        window.location.href = "index.html";
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
      const homeContainer = document.querySelector('.home-container');
      if (homeContainer) {
        homeContainer.prepend(welcome);
      }
    }
    if (welcome) welcome.textContent = `Welcome, ${user.displayName || user.email}`;

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
          alert("Logout error: " + error.message);
        });
    });
  }

}); // end DOMContentLoaded
