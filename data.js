// db の重複定義を防ぐ
if (typeof db === 'undefined') {
  const db = firebase.firestore();
}

const uid = "XlWqWCKnchXAbY73Lc3jrtEVlVk2";
let currentUser = null;
let charactersData = {};

firebase.auth().onAuthStateChanged(user => {
  currentUser = user;
  const main = document.getElementById("mainContent");
  const login = document.getElementById("loginArea");
  if (user && user.uid === uid) {
    main.classList.remove("hidden");
    login.classList.add("hidden");
  } else if (!user) {
    main.classList.remove("hidden"); // 閲覧者でもmainを表示
    login.classList.add("hidden");
  } else {
    alert("閲覧モードで表示します。");
    main.classList.remove("hidden");
    login.classList.add("hidden");
  }
  loadAllData();
});

function login() {
  const email = document.getElementById("email").value;
  const pass = document.getElementById("password").value;
  firebase.auth().signInWithEmailAndPassword(email, pass).catch(e => {
    alert("ログイン失敗: " + e.message);
  });
}

function logout() {
  firebase.auth().signOut().then(() => location.reload());
}

async function loadAllData() {
  charactersData = {};
  const snapshot = await db.collection("characters").get();
  snapshot.forEach(doc => {
    const data = doc.data();
    const world = data.world || "未分類";
    if (!charactersData[world]) charactersData[world] = [];
    charactersData[world].push({ id: doc.id, ...data });
  });
  displayCharacters();
}

function displayCharacters() {
  const container = document.getElementById("charList");
  container.innerHTML = "";

  Object.keys(charactersData).forEach(world => {
    const worldDetails = document.createElement("details");
    worldDetails.open = false;
    const worldSummary = document.createElement("summary");
    worldSummary.textContent = world;
    worldDetails.appendChild(worldSummary);

    const worldDiv = document.createElement("div");
    worldDiv.className = "card-container";

    charactersData[world].forEach(char => {
      const card = document.createElement("details");
      card.className = "card";
      card.open = false;

      const sum = document.createElement("summary");
      sum.innerHTML = `<img src="${char.thumbImages?.[0] || ''}" alt="icon"><br>${char.name}`;
      card.appendChild(sum);

      const content = document.createElement("div");
      content.innerHTML = `
        年齢: ${char.age || ""}<br>
        性別: ${char.gender || ""}<br>
        身長: ${char.height || ""}<br>
        体重: ${char.weight || ""}<br>
        備考: ${char.notes || ""}<br>
        タグ: ${(char.tags || []).map(t => `<span class="tag">${t}</span>`).join(" ")}<br>
        URL: ${char.url ? `<a href="${char.url}" target="_blank">${char.url}</a>` : ""}<br>
        登録: ${char.createdAt?.toDate().toLocaleString() || ""}<br>
        更新: ${char.updatedAt?.toDate().toLocaleString() || ""}<br>
        <strong>立ち絵:</strong><br>${(char.fullbodyImages || []).map(img => `<img src="${img}" style="max-width:100px;">`).join("")}
      `;

      if (currentUser && currentUser.uid === uid) {
        const delBtn = document.createElement("button");
        delBtn.textContent = "削除";
        delBtn.onclick = () => deleteCharacter(char.id);
        content.appendChild(delBtn);
      }

      card.appendChild(content);
      worldDiv.appendChild(card);
    });

    worldDetails.appendChild(worldDiv);
    container.appendChild(worldDetails);
  });
}

async function addCharacter() {
  if (!currentUser || currentUser.uid !== uid) return;

  const world = document.getElementById("worldInput").value.trim();
  const name = document.getElementById("nameInput").value.trim();
  const age = document.getElementById("ageInput").value.trim();
  const gender = document.getElementById("genderInput").value.trim();
  const height = document.getElementById("heightInput").value.trim();
  const weight = document.getElementById("weightInput").value.trim();
  const tags = document.getElementById("tagsInput").value.trim().split(" ").filter(t => t);
  const notes = document.getElementById("notesInput").value.trim();
  const url = document.getElementById("urlInput")?.value.trim() || "";

  const thumbFiles = document.getElementById("thumbInput").files;
  const fullbodyFiles = document.getElementById("fullbodyInput").files;

  const thumbImages = await Promise.all(Array.from(thumbFiles).map(file => toBase64(file)));
  const fullbodyImages = await Promise.all(Array.from(fullbodyFiles).map(file => toBase64(file)));

  const now = firebase.firestore.FieldValue.serverTimestamp();

  const charData = {
    world,
    name,
    age,
    gender,
    height,
    weight,
    tags,
    notes,
    url,
    thumbImages,
    fullbodyImages,
    createdAt: now,
    updatedAt: now
  };

  try {
    await db.collection("characters").add(charData);
    await loadAllData();
    clearForm();
  } catch (e) {
    alert("キャラの保存に失敗しました: " + e.message);
  }
}

function clearForm() {
  document.getElementById("worldInput").value = "";
  document.getElementById("nameInput").value = "";
  document.getElementById("ageInput").value = "";
  document.getElementById("genderInput").value = "";
  document.getElementById("heightInput").value = "";
  document.getElementById("weightInput").value = "";
  document.getElementById("tagsInput").value = "";
  document.getElementById("notesInput").value = "";
  document.getElementById("urlInput").value = "";
  document.getElementById("thumbInput").value = "";
  document.getElementById("fullbodyInput").value = "";
}

function toBase64(file) {
  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload = () => res(reader.result);
    reader.onerror = err => rej(err);
    reader.readAsDataURL(file);
  });
}

async function deleteCharacter(id) {
  if (!confirm("本当に削除しますか？")) return;
  try {
    await db.collection("characters").doc(id).delete();
    await loadAllData();
  } catch (e) {
    alert("削除に失敗: " + e.message);
  }
}
