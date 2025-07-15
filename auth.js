let isOwner = false;
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

auth.onAuthStateChanged(user => {
  const loginArea = document.getElementById("loginArea");
  const formArea  = document.getElementById("formArea");
  const mainArea  = document.getElementById("mainContent");

  if (user) {
    isOwner = (user.uid === "XlWqWCKnchXAbY73Lc3jrtEVlVk2");
    loginArea.classList.add("hidden");
    formArea.style.display = isOwner ? "block" : "none";
    mainArea.classList.remove("hidden");
    loadCharacters();
  } else {
    isOwner = false;
    loginArea.classList.add("hidden");
    formArea.style.display = "none";
    mainArea.classList.remove("hidden");
    loadCharacters();
  }
});

function login() {
  const email = document.getElementById("email").value;
  const pw = document.getElementById("password").value;
  auth.signInWithEmailAndPassword(email, pw).catch(e => alert("ログイン失敗：" + e.message));
}

function logout() {
  auth.signOut().then(() => {
    document.getElementById("mainContent").classList.add("hidden");
    document.getElementById("loginArea").classList.remove("hidden");
  });
}
