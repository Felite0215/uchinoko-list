// --- data.js ---
const db = firebase.firestore();

const OWNER_UID = "XlWqWCKnchXAbY73Lc3jrtEVlVk2";

let worlds = [];  // [{id, name}]
let characters = []; // [{id, data}]

const worldListElem = document.getElementById("worldList");
const filterInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortSelect");

const addWorldBtn = document.getElementById("addWorldBtn");
const worldNameInput = document.getElementById("worldNameInput");

const addCharSection = document.getElementById("addCharSection");
const saveCharBtn = document.getElementById("saveCharBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");
const charFormError = document.getElementById("charFormError");

// キャラクター入力フォーム要素
const editingCharIdInput = document.getElementById("editingCharId");
const charWorldInput = document.getElementById("charWorldInput");
const charNameInput = document.getElementById("charNameInput");
const charAgeInput = document.getElementById("charAgeInput");
const charGenderInput = document.getElementById("charGenderInput");
const charHeightInput = document.getElementById("charHeightInput");
const charWeightInput = document.getElementById("charWeightInput");
const charTagsInput = document.getElementById("charTagsInput");
const charNotesInput = document.getElementById("charNotesInput");
const charUrlInput = document.getElementById("charUrlInput");
const charThumbInput = document.getElementById("charThumbInput");
const charFullbodyInput = document.getElementById("charFullbodyInput");

addWorldBtn.onclick = async () => {
  const newWorldName = worldNameInput.value.trim();
  if (!newWorldName) {
    alert("世界観名を入力してください");
    return;
  }
  // 重複チェック
  if (worlds.some(w => w.name.toLowerCase() === newWorldName.toLowerCase())) {
    alert("同名の世界観が既に存在します");
    return;
  }
  try {
    await db.collection("worlds").add({ name: newWorldName });
    worldNameInput.value = "";
    await loadAllData();
  } catch (e) {
    alert("世界観の追加に失敗しました: " + e.message);
  }
};

saveCharBtn.onclick = async () => {
  charFormError.textContent = "";
  // 必須チェック
  if (!charWorldInput.value.trim()) {
    charFormError.textContent = "世界観名は必須です";
    return;
  }
  if (!charNameInput.value.trim()) {
    charFormError.textContent = "キャラクター名は必須です";
    return;
  }
  // 画像をBase64に変換
  try {
    const thumbs = await filesToBase64Array(charThumbInput.files);
    const fullbodies = await filesToBase64Array(charFullbodyInput.files);

    const charData = {
      worldName: charWorldInput.value.trim(),
      name: charNameInput.value.trim(),
      age: charAgeInput.value.trim(),
      gender: charGenderInput.value,
      height: charHeightInput.value.trim(),
      weight: charWeightInput.value.trim(),
      tags: charTagsInput.value.trim(),
      notes: charNotesInput.value.trim(),
      url: charUrlInput.value.trim(),
      thumbImages: thumbs,
      fullbodyImages: fullbodies,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    };

    if (editingCharIdInput.value) {
      // 編集
      await db.collection("characters").doc(editingCharIdInput.value).update(charData);
    } else {
      // 新規追加
      charData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
      await db.collection("characters").add(charData);
    }
    clearCharForm();
    await loadAllData();
    scrollToCharacter(charData.worldName, charData.name);
  } catch (e) {
    charFormError.textContent = "キャラの保存に失敗しました: " + e.message;
  }
};

cancelEditBtn.onclick = () => {
  clearCharForm();
};

function clearCharForm() {
  editingCharIdInput.value = "";
  charWorldInput.value = "";
  charNameInput.value = "";
  charAgeInput.value = "";
  charGenderInput.value = "";
  charHeightInput.value = "";
  charWeightInput.value = "";
  charTagsInput.value = "";
  charNotesInput.value = "";
  charUrlInput.value = "";
  charThumbInput.value = "";
  charFullbodyInput.value = "";
  charFormError.textContent = "";
  addCharSection.classList.add("hidden");
}

function filesToBase64Array(fileList) {
  return new Promise((resolve, reject) => {
    if (!fileList || fileList.length === 0) resolve([]);
    const results = [];
    let count = 0;
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const reader = new FileReader();
      reader.onload = e => {
        results.push(e.target.result);
        count++;
        if (count === fileList.length) resolve(results);
      };
      reader.onerror = e => {
        reject(e);
      };
      reader.readAsDataURL(file);
    }
  });
}

async function loadAllData() {
  // 世界観取得
  const worldSnap = await db.collection("worlds").orderBy("name").get();
  worlds = worldSnap.docs.map(doc => ({ id: doc.id, name: doc.data().name }));

  // キャラクター取得
  const charSnap = await db.collection("characters").get();
  characters = charSnap.docs.map(doc => ({ id: doc.id, data: doc.data() }));

  renderWorlds();
}

function renderWorlds() {
  worldListElem.innerHTML = "";
  const filterText = filterInput.value.trim().toLowerCase();
  const sortKey = sortSelect.value;

  // 世界観ごとにグループ化
  const grouped = {};
  worlds.forEach(w => grouped[w.name] = []);
  characters.forEach(c => {
    if (grouped[c.data.worldName]) grouped[c.data.worldName].push({...c, data: c.data});
    else grouped[c.data.worldName] = [{...c, data: c.data}];
  });

  // フィルタ処理
  for (const worldName in grouped) {
    // フィルタ適用: 世界観名 or 1キャラでもヒットしなければスキップ
    if (!worldName.toLowerCase().includes(filterText) && 
        !grouped[worldName].some(c => matchCharacterFilter(c.data, filterText))) {
      continue;
    }

    // details 折りたたみ（初期は閉じている）
    const detailsElem = document.createElement("details");
    detailsElem.open = false;

    // summaryに世界観名
    const summary = document.createElement("summary");
    summary.textContent = worldName;
    detailsElem.appendChild(summary);

    // 並び替え
    const sortedChars = grouped[worldName].slice();
    sortedChars.sort((a,b) => {
      if(sortKey==="name") {
        return a.data.name.localeCompare(b.data.name);
      } else if(sortKey==="createdAt") {
        return (a.data.createdAt?.seconds||0) - (b.data.createdAt?.seconds||0);
      } else if(sortKey==="updatedAt") {
        return (a.data.updatedAt?.seconds||0) - (b.data.updatedAt?.seconds||0);
      }
      return 0;
    });

    // キャラ横並びのdiv
    const charContainer = document.createElement("div");
    charContainer.className = "card-container";

    for (const charObj of sortedChars) {
      if (!matchCharacterFilter(charObj.data, filterText)) continue;

      const card = createCharacterCard(charObj.id, charObj.data);
      charContainer.appendChild(card);
    }
    detailsElem.appendChild(charContainer);
    worldListElem.appendChild(detailsElem);
  }

  // 編集権限があるならキャラ追加フォームを表示
  addCharSection.classList.toggle("hidden", !window.isOwner);
}

function matchCharacterFilter(charData, filterText) {
  if (!filterText) return true;
  const f = filterText.toLowerCase();
  if (charData.name?.toLowerCase().includes(f)) return true;
  if (charData.tags?.toLowerCase().includes(f)) return true;
  if (charData.notes?.toLowerCase().includes(f)) return true;
  if (charData.url?.toLowerCase().includes(f)) return true;
  return false;
}

function createCharacterCard(id, data) {
  const card = document.createElement("div");
  card.className = "card";

  // header (thumbnail + name)
  const header = document.createElement("div");
  header.className = "char-header";

  // サムネイル画像（1枚目）
  if (data.thumbImages && data.thumbImages.length > 0) {
    const img = document.createElement("img");
    img.className = "thumb";
    img.src = data.thumbImages[0];
    header.appendChild(img);
  }

  const nameSpan = document.createElement("span");
  nameSpan.textContent = data.name;
  header.appendChild(nameSpan);

  card.appendChild(header);

  // details 折りたたみで詳細表示
  const details = document.createElement("details");
  details.style.marginTop = "10px";

  const summary = document.createElement("summary");
  summary.textContent = "詳細";
  details.appendChild(summary);

  const detailDiv = document.createElement("div");

  const fields = [
    ["世界観名", data.worldName],
    ["年齢", data.age],
    ["性別", data.gender],
    ["身長", data.height],
    ["体重", data.weight],
    ["タグ", data.tags],
    ["備考", data.notes],
  ];
  fields.forEach(([label, val]) => {
    if (val) {
      const p = document.createElement("p");
      p.innerHTML = `<strong>${label}:</strong> ${escapeHtml(val)}`;
      detailDiv.appendChild(p);
    }
  });

  // URLリンク
  if (data.url) {
    const p = document.createElement("p");
    const a = document.createElement("a");
    a.href = data.url;
    a.textContent = data.url;
    a.target = "_blank";
    p.appendChild(document.createElement("strong")).textContent = "URL: ";
    p.appendChild(a);
    detailDiv.appendChild(p);
  }

  // 顔画像複数表示
  if (data.thumbImages && data.thumbImages.length > 0) {
    const label = document.createElement("p");
    label.textContent = "顔画像:";
    detailDiv.appendChild(label);
    const imgList = document.createElement("div");
    imgList.className = "img-list";
    data.thumbImages.forEach(src => {
      const img = document.createElement("img");
      img.src = src;
      imgList.appendChild(img);
    });
    detailDiv.appendChild(imgList);
  }

  // 立ち絵複数表示
  if (data.fullbodyImages && data.fullbodyImages.length > 0) {
    const label = document.createElement("p");
    label.textContent = "立ち絵画像:";
    detailDiv.appendChild(label);
    const imgList = document.createElement("div");
    imgList.className = "img-list";
    data.fullbodyImages.forEach(src => {
      const img = document.createElement("img");
      img.src = src;
      imgList.appendChild(img);
    });
    detailDiv.appendChild(imgList);
  }

  // 作成・更新日時表示
  const createdAt = data.createdAt ? data.createdAt.toDate().toLocaleString() : "不明";
  const updatedAt = data.updatedAt ? data.updatedAt.toDate().toLocaleString() : "不明";
  const dateP = document.createElement("p");
  dateP.innerHTML = `<strong>作成日時:</strong> ${createdAt}<br><strong>更新日時:</strong> ${updatedAt}`;
  detailDiv.appendChild(dateP);

  // 編集・削除ボタン（所有者のみ表示）
  if (window.isOwner) {
    const btnEdit = document.createElement("button");
    btnEdit.textContent = "編集";
    btnEdit.onclick = () => {
      startEditCharacter(id, data);
    };
    const btnDel = document.createElement("button");
    btnDel.textContent = "削除";
    btnDel.onclick = async () => {
      if (confirm(`「${data.name}」を削除します。よろしいですか？`)) {
        await db.collection("characters").doc(id).delete();
        await loadAllData();
      }
    };
    detailDiv.appendChild(btnEdit);
    detailDiv.appendChild(btnDel);
  }

  details.appendChild(detailDiv);
  card.appendChild(details);

  return card;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function startEditCharacter(id, data) {
  editingCharIdInput.value = id;
  charWorldInput.value = data.worldName || "";
  charNameInput.value = data.name || "";
  charAgeInput.value = data.age || "";
  charGenderInput.value = data.gender || "";
  charHeightInput.value = data.height || "";
  charWeightInput.value = data.weight || "";
  charTagsInput.value = data.tags || "";
  charNotesInput.value = data.notes || "";
  charUrlInput.value = data.url || "";
  // 画像は再アップロードが必要
  addCharSection.classList.remove("hidden");
  window.scrollTo({top:0,behavior:"smooth"});
}

filterInput.oninput = () => loadAllData();
sortSelect.onchange = () => loadAllData();

function scrollToCharacter(worldName, charName) {
  // 折りたたみを開いてその中にあるキャラを探してスクロールする処理を必要に応じて実装できます
}

window.loadAllData = loadAllData;

