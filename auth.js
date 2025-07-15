let isOwner = false;

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

auth.onAuthStateChanged((user) => {
  if (user) {
    isOwner = (user.uid === "XlWqWCKnchXAbY73Lc3jrtEVlVk2");
    document.getElementById("mainContent").classList.remove("hidden");
    document.getElementById("loginArea").classList.add("hidden");
    loadCharacters();
  } else {
    isOwner = false;
    document.getElementById("mainContent").classList.remove("hidden");
    document.getElementById("loginArea").classList.add("hidden");
    loadCharacters();
  }
});

function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  auth.signInWithEmailAndPassword(email, password)
    .catch((error) => {
      alert("ログイン失敗：" + error.message);
    });
}

function logout() {
  auth.signOut().then(() => {
    // ログアウト後ログイン画面に戻す
    document.getElementById("mainContent").classList.add("hidden");
    document.getElementById("loginArea").classList.remove("hidden");
  });
}
