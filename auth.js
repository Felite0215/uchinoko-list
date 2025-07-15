firebase.auth().onAuthStateChanged((user) => {
  const loginArea = document.getElementById("loginArea");
  const mainContent = document.getElementById("mainContent");
  const formArea = document.getElementById("formArea");

  if (user && user.uid === "XlWqWCKnchXAbY73Lc3jrtEVlVk2") {
    // 管理者ログイン
    loginArea.classList.add("hidden");
    formArea.style.display = "block";
    mainContent.classList.remove("hidden");
    loadCharacters();
  } else {
    // 閲覧者または未ログイン
    loginArea.classList.add("hidden");
    formArea.style.display = "none";
    mainContent.classList.remove("hidden");
    loadCharacters();
  }
});

function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  firebase.auth().signInWithEmailAndPassword(email, password)
    .catch((error) => {
      alert("ログインに失敗しました: " + error.message);
    });
}

function logout() {
  firebase.auth().signOut();
  location.reload();
}
