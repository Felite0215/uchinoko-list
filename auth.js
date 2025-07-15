firebase.auth().onAuthStateChanged(user => {
  const UID = "XlWqWCKnchXAbY73Lc3jrtEVlVk2";
  const isOwner = user && user.uid === UID;
  document.getElementById("loginArea").classList.toggle("hidden", isOwner);
  document.getElementById("mainContent").classList.toggle("hidden", !isOwner && !user);

  if (user) {
    if (!isOwner) {
      document.querySelectorAll("#formArea input, #formArea textarea, #formArea select, #formArea button")
        .forEach(el => el.disabled = true);
    }
    loadCharacters();
  }
});

function login() {
  const email = document.getElementById("email").value;
  const pw = document.getElementById("password").value;
  firebase.auth().signInWithEmailAndPassword(email, pw)
    .catch(e => alert("ログイン失敗: " + e.message));
}

function logout() {
  firebase.auth().signOut();
}
