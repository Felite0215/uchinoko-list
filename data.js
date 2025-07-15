const db = firebase.firestore();

function addCharacter() {
  if (!isOwner) {
    alert("あなたには追加権限がありません");
    return;
  }

  const world = document.getElementById("worldInput").value;
  const name = document.getElementById("nameInput").value;
  const age = document.getElementById("ageInput").value;
  const gender = document.getElementById("genderInput").value;
  const height = document.getElementById("heightInput").value;
  const weight = document.getElementById("weightInput").value;
  const tags = document.getElementById("tagsInput").value.trim().split(/\s+/);
  const notes = document.getElementById("notesInput").value;

  const createdAt = new Date();
  const updatedAt = new Date();

  db.collection("characters").add({
    world,
    name,
    age,
    gender,
    height,
    weight,
    tags,
    notes,
    createdAt,
    updatedAt,
  })
  .then(() => {
    loadCharacters();
  })
  .catch((error) => {
    alert("キャラの保存に失敗しました: " + error.message);
  });
}

function loadCharacters() {
  const list = document.getElementById("charList");
  list.innerHTML = "";

  db.collection("characters").orderBy("createdAt", "desc").get()
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        const data = doc.data();

        const container = document.createElement("div");
        container.className = "card";

        const summary = document.createElement("summary");
        summary.textContent = data.name;

        const thumb = document.createElement("div");
        thumb.textContent = "世界観：" + data.world;

        const content = document.createElement("div");
        content.innerHTML = `
          <p>年齢：${data.age}</p>
          <p>性別：${data.gender}</p>
          <p>身長：${data.height}</p>
          <p>体重：${data.weight}</p>
          <p>タグ：${(data.tags || []).map(tag => `<span class="tag">${tag}</span>`).join("")}</p>
          <p>備考：${data.notes}</p>
          <p>作成日時：${data.createdAt?.toDate().toLocaleString() || "不明"}</p>
          <p>更新日時：${data.updatedAt?.toDate().toLocaleString() || "不明"}</p>
        `;

        container.appendChild(summary);
        container.appendChild(thumb);
        container.appendChild(content);

        // 編集削除はオーナーのみ
        if (isOwner) {
          const editBtn = document.createElement("button");
          editBtn.textContent = "編集";
          const delBtn = document.createElement("button");
          delBtn.textContent = "削除";
          delBtn.onclick = () => {
            db.collection("characters").doc(doc.id).delete().then(() => {
              loadCharacters();
            });
          };
          container.appendChild(editBtn);
          container.appendChild(delBtn);
        }

        list.appendChild(container);
      });
    });
}

function filterCharacters() {
  // 検索機能（必要に応じて実装）
}
