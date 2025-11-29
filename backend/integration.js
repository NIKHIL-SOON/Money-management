import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ✅ YOUR REAL KEYS
const firebaseConfig = {
  apiKey: "AIzaSyCcb-ac-peDLhc-qo8Wny3qh_3F687fufE",
  authDomain: "backendoff-app.firebaseapp.com",
  projectId: "backendoff-app",
  storageBucket: "backendoff-app.firebasestorage.app",
  messagingSenderId: "14975969440",
  appId: "1:14975969440:web:4accd8dbc9b02b665901c5",
  measurementId: "G-LSRKJKMPBK"
};

// Initialize
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// Get Elements
const authForm = document.getElementById('authForm');
const googleBtn = document.getElementById('googleBtn');
const nameInput = document.getElementById('inputName');
const emailInput = document.getElementById('inputEmail');
const passInput = document.getElementById('inputPassword');
const nameFieldContainer = document.getElementById('name-field'); 

// A. GOOGLE LOGIN
if(googleBtn) {
    googleBtn.addEventListener('click', async () => {
        try {
            const result = await signInWithPopup(auth, provider);
            // Check if user needs the 5000 bonus
            await checkAndCreateUser(result.user, result.user.displayName);
            // Redirect to Dashboard
            window.location.href = "index.html"; 
        } catch (error) {
            console.error(error);
            alert("Google Error: " + error.message);
        }
    });
}

// B. EMAIL FORM SUBMIT (Smart Logic)
if(authForm) {
    authForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Stop page reload

        const email = emailInput.value;
        const password = passInput.value;
        const name = nameInput.value;

        // CHECK MODE: We look at your teammate's CSS class to decide
        const isSignupMode = nameFieldContainer.classList.contains('visible-field');

        try {
            if (isSignupMode) {
                // --- SIGN UP LOGIC ---
                if(password.length < 6) {
                    alert("⚠️ Password must be at least 6 characters.");
                    return;
                }
                
                // 1. Create Account
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;

                // 2. Set Display Name
                await updateProfile(user, { displayName: name });

                // 3. Give 5000 Bonus
                await checkAndCreateUser(user, name);

                alert("🎉 Account Created! Redirecting...");
                window.location.href = "index.html";

            } else {
                // --- LOGIN LOGIC ---
                await signInWithEmailAndPassword(auth, email, password);
                window.location.href = "index.html";
            }
        } catch (error) {
            console.error(error);
            // Friendly Error Messages
            if (error.code === 'auth/invalid-credential') {
                alert("❌ Wrong Email or Password!");
            } else if (error.code === 'auth/email-already-in-use') {
                alert("⚠️ This email is already registered. Please click 'Log In'.");
            } else {
                alert("Error: " + error.message);
            }
        }
    });
}

// C. DATABASE HELPER
async function checkAndCreateUser(user, fullName) {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    // Only give money if they are NEW
    if (!userSnap.exists()) {
        await setDoc(userRef, {
            name: fullName || user.email.split('@')[0],
            balance: 5000,
            email: user.email,
            createdAt: new Date()
        });
    }
}