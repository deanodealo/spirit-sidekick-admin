import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyA3bQPYdV4Radx6xohL40KbOq2vnVVspzE",
  authDomain: "spirit-sidekick.firebaseapp.com",
  projectId: "spirit-sidekick",
  storageBucket: "spirit-sidekick.firebasestorage.app",
  messagingSenderId: "662710493586",
  appId: "1:662710493586:web:06ea3d0282c3243cd7a14b",
  measurementId: "G-V6SF73FXMK"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const disciplines = [
  "Mediumship",
  "Trance Mediumship",
  "Healing",
  "Inspirational Speaking",
  "Philosophy"
];

const categoryGrid = document.getElementById("categoryGrid");
const exercisesContainer = document.getElementById("exercisesContainer");
const exerciseList = document.getElementById("exerciseList");
const disciplineTitle = document.getElementById("disciplineTitle");
const backBtn = document.getElementById("backBtn");

// Render clickable cards
disciplines.forEach(name => {
  const card = document.createElement("div");
  card.className = "card";
  card.innerHTML = `
    <img src="images/${name}.png" alt="${name}" />
    <h3>${name}</h3>
  `;
  card.addEventListener("click", () => loadExercises(name));
  categoryGrid.appendChild(card);
});

// Load exercises for a specific discipline
async function loadExercises(discipline) {
  categoryGrid.style.display = "none";
  exercisesContainer.classList.remove("hidden");
  disciplineTitle.textContent = discipline;
  exerciseList.innerHTML = "";

  const q = query(collection(db, "exercises"), where("discipline", "==", discipline));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    exerciseList.innerHTML = "<p>No exercises available.</p>";
    return;
  }

  snapshot.forEach(doc => {
    const ex = doc.data();
    const div = document.createElement("div");
    div.className = "exercise";
    div.innerHTML = `
      <h4>${ex.title}</h4>
      <p>${ex.description}</p>
      <p class="price">£${ex.price.toFixed(2)}</p>
      <a href="${ex.pdfUrl}" target="_blank">View PDF</a>
    `;
    exerciseList.appendChild(div);
  });
}

// Back button
backBtn.addEventListener("click", () => {
  categoryGrid.style.display = "grid";
  exercisesContainer.classList.add("hidden");
});
