function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  firebase.auth().signInWithEmailAndPassword(email, password)
    .catch(error => alert("ログイン失敗: " + error.message));
}

function logout() {
  firebase.auth().signOut().then(() => location.reload());
}
