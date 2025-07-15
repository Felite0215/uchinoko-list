let isOwner = false;

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

auth.onAuthStateChanged((user) => {
  if (user) {
    // 自分がログインしている場合
    isOwner = (user.uid === "XlWqWCKnchXAbY73Lc3jrtEVlVk2");
    document.getElementById("mainContent").classList.remove("hidden");
    document.getElementById("loginArea").classList.add("hidden");
    loadCharacters();
  } else {
    // 未ログインでも閲覧だけ許可
    isOwner = false;
    document.getElementById("mainContent").classList.remove("hidden");
    document.getElementById("loginArea").classList.add("hidden");
    loadCharacters(); // 表示だけ行う
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
  auth.signOut();
}
