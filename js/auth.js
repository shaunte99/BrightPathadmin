import { auth, db } from './firebase.js';
import { signInWithEmailAndPassword } from "firebase/auth";
import { ref, get, child } from "firebase/database";

const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');

loginForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  signInWithEmailAndPassword(auth, email, password)
    .then(userCredential => {
      const uid = userCredential.user.uid;

      // Get user role from Realtime Database
      const dbRef = ref(db);
      get(child(dbRef, `users/${uid}`)).then((snapshot) => {
        if (snapshot.exists()) {
          const role = snapshot.val().role;
          if (role === 'admin') {
            window.location.href = 'admin.html';
          } else if (role === 'tutor') {
            window.location.href = 'tutor.html';
          } else {
            loginError.textContent = "Role not recognized.";
          }
        } else {
          loginError.textContent = "User data not found in database.";
        }
      }).catch(err => {
        loginError.textContent = "Database error: " + err.message;
      });

    })
    .catch(error => {
      loginError.textContent = "Login failed: " + error.message;
    });
});
