const UID = "XlWqWCKnchXAbY73Lc3jrtEVlVk2";
let allCharacters = {};
let currentUserId = null;

// ファイルをBase64に変換するヘルパー関数
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = e => reject(e);
    reader.readAsDataURL(file);
  });
}

// ファイルリストをBase64の配列に変換
async function convertFilesToBase64(fileList) {
  const arr = [];
  for (const file of fileList) {
    const base64 = await fileToBase64(file);
    arr.push(base64);
  }
  return arr;
}

async function addCharacter() {
  const world = document.getElementById("worldInput").value.trim();
  const name = document.getElementById("nameInput").value.trim();
  const age = document.getElementById("ageInput").value.trim();
  const gender = document.getElementById("genderInput").value.trim();
  const height = document.getElementById("heightInput").value.trim();
  const weight = document.getElementById("weightInput").value.trim();
  const tags = document.getElementById("tagsInput").value.trim().split(/\s+/).filter(t => t);
  const notes = document.getElementById("notesInput").value.trim();

  if (!world || !name) {
    alert("世界観名とキャラクター名は必須です");
    return;
  }

  const thumbFiles = document.getElementById("thumbInput").files;
  const fullbodyFiles = document.getElementById("fullbodyInput").files;

  const addButton = document.querySelector("#formArea button");
  addButton.disabled = true;

  try {
    const thumbBase64 = await convertFilesToBase64(thumbFiles);
    const fullbodyBase64 = await convertFilesToBase64(fullbodyFiles);

    const newChar = {
      uid: currentUserId,
      world,
      name,
      age,
      gender,
      height,
      weight,
      tags,
      notes,
      thumbs: thumbBase64,
      fullbodies: fullbodyBase64,
      created: Date.now(),
      updated: Date.now()
    };

    await db.collection("characters").add(newChar);

    // 入力欄クリア
    document.querySelectorAll("#formArea input, #formArea textarea").forEach(el => el.value = "");
    document.getElementById("thumbInput").value = "";
    document.getElementById("fullbodyInput").value = "";

    loadCharacters();

  } catch (e) {
    alert("キャラの保存に失敗しました: " + e.message);
  } finally {
    addButton.disabled = false;
  }
}

async function loadCharacters() {
  const sortKey = document.getElementById("sortSelect").value;
  let query = db.collection("characters");

  // Firestoreでの並び替え対応（created・updated・name）
  if (sortKey === "created") query = query.orderBy("created", "asc");
  else if (sortKey === "updated") query = query.orderBy("updated", "asc");
  else if (sortKey === "name") query = query.orderBy("name", "asc");

  const snap = await query.get();

  allCharacters = {};
  snap.forEach(doc => {
    const data = doc.data();
    const world = data.world || "未分類";
    if (!allCharacters[world]) allCharacters[world] = [];
    allCharacters[world].push({ id: doc.id, ...data });
  });

  renderCharacters();
}

function renderCharacters() {
  const container = document.getElementById("charList");
  container.innerHTML = "";

  Object.keys(allCharacters).sort().forEach(world => {
    const details = document.createElement("details");
    details.innerHTML = `<summary>${world}（${allCharacters[world].length}人）</summary>`;
    details.open = false;

    const cardBox = document.createElement("div");
    cardBox.className = "card-container";

    allCharacters[world].forEach(char => {
      const card = document.createElement("div");
      card.className = "card";

      // Base64画像のうち、最初の画像を表示。なければ空欄。
      const thumbSrc = (char.thumbs && char.thumbs.length > 0) ? char.thumbs[0] : "";

      card.innerHTML = `
        <img src="${thumbSrc}" alt="${char.name}" />
        <strong>${char.name}</strong><br>
        年齢: ${char.age || "-"}<br>
        性別: ${char.gender || "-"}<br>
        身長: ${char.height || "-"} / 体重: ${char.weight || "-"}<br>
        ${char.tags?.map(t => `<span class="tag">${t}</span>`).join(" ") || ""}
        <br>
        <small>${char.notes || ""}</small><br>
        ${char.uid === currentUserId ? `
          <button onclick="editCharacter('${char.id}')">編集</button>
          <button onclick="deleteCharacter('${char.id}')">削除</button>` : ""}
      `;

      cardBox.appendChild(card);
    });

    details.appendChild(cardBox);
    container.appendChild(details);
  });
}

function filterCharacters() {
  const keyword = document.getElementById("searchInput").value.toLowerCase();
  const filtered = {};

  Object.keys(allCharacters).forEach(world => {
    const matches = allCharacters[world].filter(c =>
      c.name.toLowerCase().includes(keyword) ||
      (c.tags && c.tags.some(tag => tag.toLowerCase().includes(keyword)))
    );
    if (matches.length) filtered[world] = matches;
  });

  const container = document.getElementById("charList");
  container.innerHTML = "";

  Object.keys(filtered).sort().forEach(world => {
    const details = document.createElement("details");
    details.innerHTML = `<summary>${world}（${filtered[world].length}人）</summary>`;
    details.open = true;

    const cardBox = document.createElement("div");
    cardBox.className = "card-container";

    filtered[world].forEach(char => {
      const card = document.createElement("div");
      card.className = "card";
      const thumbSrc = (char.thumbs && char.thumbs.length > 0) ? char.thumbs[0] : "";
      card.innerHTML = `
        <img src="${thumbSrc}" alt="${char.name}" />
        <strong>${char.name}</strong><br>
        ${char.tags?.map(t => `<span class="tag">${t}</span>`).join(" ") || ""}
      `;
      cardBox.appendChild(card);
    });

    details.appendChild(cardBox);
    container.appendChild(details);
  });
}

// 編集機能
async function editCharacter(id) {
  const doc = await db.collection("characters").doc(id).get();
  const char = doc.data();
  if (char.uid !== currentUserId) return alert("編集できません");

  document.getElementById("worldInput").value = char.world;
  document.getElementById("nameInput").value = char.name;
  document.getElementById("ageInput").value = char.age || "";
  document.getElementById("genderInput").value = char.gender || "";
  document.getElementById("heightInput").value = char.height || "";
  document.getElementById("weightInput").value = char.weight || "";
  document.getElementById("tagsInput").value = (char.tags || []).join(" ");
  document.getElementById("notesInput").value = char.notes || "";

  // Base64画像は編集画面に戻すのが難しいため一旦クリアにします
  document.getElementById("thumbInput").value = "";
  document.getElementById("fullbodyInput").value = "";

  // 元のデータは削除して、新規登録で更新にする簡易方式
  await db.collection("characters").doc(id).delete();

  loadCharacters();
}

// 削除機能
async function deleteCharacter(id) {
  if (confirm("このキャラを削除しますか？")) {
    await db.collection("characters").doc(id).delete();
    loadCharacters();
  }
}

// 認証状態でUID取得
firebase.auth().onAuthStateChanged(user => {
  currentUserId = user?.uid || null;
  if(currentUserId) loadCharacters();
});
