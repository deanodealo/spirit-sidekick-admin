import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc, query, where, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import { db, storage, auth } from './firebase-config.js';

const categorySelect = document.getElementById("categorySelect");
const exerciseList = document.getElementById("exerciseList");
const uploadForm = document.getElementById("uploadForm");
const loadingSpinner = document.getElementById("loadingSpinner"); // spinner element

// Add your admin UIDs here — replace with actual admin UIDs from Firebase Console
const adminUIDs = [
  "E3rJkc9O4NYSoeZ1bOqmyhtu2rR2",
  "Dc2FL0Jff5gCdXaWTru2e7sLJ2U2"
];

// Protect the admin dashboard by checking if logged-in user is an admin
onAuthStateChanged(auth, (user) => {
  if (!user || !adminUIDs.includes(user.uid)) {
    alert("Access denied. You are not authorized to view this page.");
    auth.signOut();
    window.location.href = "/login.html";
  } else {
    loadExercises(categorySelect.value);
  }
});

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
      const card = btn.closest(".exerciseCard");
      const fileUrl = card.querySelector("a").href;

      if (confirm("Are you sure you want to delete this exercise and its PDF?")) {
        try {
          const decodedUrl = decodeURIComponent(fileUrl);
          const basePath = decodedUrl.split("/o/")[1].split("?")[0]; // e.g., exercises/category/filename.pdf
          const fileRef = ref(storage, basePath);
          await deleteObject(fileRef);

          await deleteDoc(doc(db, "exercises", id));

          alert("Exercise deleted successfully.");
          loadExercises(categorySelect.value); // refresh
        } catch (err) {
          console.error("Delete failed:", err);
          alert("Failed to delete exercise. See console for details.");
        }
      }
    });
  });
}

// 🧠 Upload handler with spinner
uploadForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  loadingSpinner.classList.remove("hidden");  // Show spinner

  try {
    const title = document.getElementById("titleInput").value;
    const description = document.getElementById("descriptionInput").value;
    const price = parseFloat(document.getElementById("priceInput").value);
    const category = categorySelect.value;

    const fileInput = document.getElementById("pdfFile");
    const file = fileInput.files[0];

    if (!file) throw new Error("Please select a PDF.");

    const fileRef = ref(storage, `exercises/${category}/${file.name}`);
    await uploadBytes(fileRef, file);
    const downloadURL = await getDownloadURL(fileRef);

    await addDoc(collection(db, "exercises"), {
      title,
      description,
      discipline: category,
      price,
      pdfUrl: downloadURL,
      createdAt: new Date()
    });

    alert("Upload successful.");
    uploadForm.reset();
    loadExercises(category);
  } catch (err) {
    alert("Upload failed: " + err.message);
  } finally {
    loadingSpinner.classList.add("hidden");  // Hide spinner
  }
});

// Watch for category changes
categorySelect.addEventListener("change", () => {
  loadExercises(categorySelect.value);
});
