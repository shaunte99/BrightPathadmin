// ================= FIREBASE INIT =================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAy-WQUbH3WNPh_V9JI13p9gwIUQMGOgXw",
  authDomain: "brightpath-d34ab.firebaseapp.com",
  projectId: "brightpath-d34ab",
  storageBucket: "brightpath-d34ab.firebasestorage.app",
  messagingSenderId: "986348759672",
  appId: "1:986348759672:web:aec8a20735e8aeb3969b8d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Only these emails are allowed
const allowedAdmins = [
  "shaunmatsetela@gmail.com",
  "brightpathaftercare@gmail.com"
];

// Form submit
const form = document.querySelector(".auth-form");
const card = document.querySelector(".auth-card");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = form.querySelector('input[type="email"]').value.trim();
  const password = form.querySelector('input[type="password"]').value;

  try {
    const userCred = await signInWithEmailAndPassword(auth, email, password);

    if (!allowedAdmins.includes(userCred.user.email)) {
      await signOut(auth);
      shakeCard();
      alert("Access denied. Unauthorized account.");
      return;
    }

    // Success → redirect to dashboard
    window.location.href = "index.html";

  } catch (error) {
    shakeCard();
    alert("Invalid email or password.");
  }
});

// ================= SHAKE EFFECT =================
function shakeCard() {
  card.classList.add("shake");
  setTimeout(() => card.classList.remove("shake"), 500);
}
