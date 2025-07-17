// admin.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc, query, where, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import { db, storage, auth } from './firebase-config.js';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

const categorySelect = document.getElementById("categorySelect");
const exerciseList = document.getElementById("exerciseList");
const uploadForm = document.getElementById("uploadForm");

// 🧠 Load exercises by category
async function loadExercises(category) {
  exerciseList.innerHTML = "Loading...";

  const q = query(collection(db, "exercises"), where("discipline", "==", category));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    exerciseList.innerHTML = "<p>No exercises yet.</p>";
    return;
  }

  exerciseList.innerHTML = "";

  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    const card = document.createElement("div");
    card.className = "exerciseCard";
    card.innerHTML = `
      <h3>${data.title}</h3>
      <p><strong>Description:</strong> ${data.description}</p>
      <p><strong>Price:</strong> £${data.price.toFixed(2)}</p>
      <a href="${data.pdfUrl}" target="_blank">View PDF</a>
      <button class="deleteBtn" data-id="${docSnap.id}">Delete</button>
    `;
    exerciseList.appendChild(card);
  });

  // Attach delete handlers
  document.querySelectorAll(".deleteBtn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-id");
      if (confirm("Are you sure you want to delete this exercise?")) {
        await deleteDoc(doc(db, "exercises", id));
        loadExercises(category); // refresh list
      }
    });
  });
}

// 🧠 Upload handler
uploadForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const title = document.getElementById("title").value;
  const description = document.getElementById("description").value;
  const category = categorySelect.value;
  const fileInput = document.getElementById("pdfFile");
  const file = fileInput.files[0];

  if (!file) return alert("Please select a PDF.");

  const fileRef = ref(storage, `exercises/${category}/${file.name}`);
  await uploadBytes(fileRef, file);
  const downloadURL = await getDownloadURL(fileRef);

  await addDoc(collection(db, "exercises"), {
    title,
    description,
    discipline: category,
    price: 4.99,
    pdfUrl: downloadURL,
    createdAt: new Date()
  });

  alert("Upload successful.");
  uploadForm.reset();
  loadExercises(category);
});

// Watch for category changes
categorySelect.addEventListener("change", () => {
  loadExercises(categorySelect.value);
});

// Load default on page load
document.addEventListener("DOMContentLoaded", () => {
  loadExercises(categorySelect.value);
});
