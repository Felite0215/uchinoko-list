// --- auth.js ---
document.addEventListener("DOMContentLoaded", () => {
  const loginArea = document.getElementById("loginArea");
  const mainContent = document.getElementById("mainContent");
  const loginBtn = document.getElementById("loginBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const loginError = document.getElementById("loginError");

  loginBtn.onclick = async () => {
    loginError.textContent = "";
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    try {
      await firebase.auth().signInWithEmailAndPassword(email, password);
    } catch (e) {
      loginError.textContent = "ログイン失敗: " + e.message;
    }
  };

  logoutBtn.onclick = async () => {
    await firebase.auth().signOut();
  };

  firebase.auth().onAuthStateChanged(user => {
    if (user) {
      loginArea.classList.add("hidden");
      mainContent.classList.remove("hidden");
      window.currentUser = user;
      window.isOwner = user.uid === OWNER_UID;
      // 画面表示処理を発火（data.jsのloadAllData()を呼ぶ）
      if (window.loadAllData) window.loadAllData();
      // 編集可能かどうかによってフォーム表示切替はdata.js側で行う
    } else {
      loginArea.classList.remove("hidden");
      mainContent.classList.add("hidden");
      window.currentUser = null;
      window.isOwner = false;
    }
  });
});
