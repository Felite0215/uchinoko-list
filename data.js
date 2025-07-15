const db = firebase.firestore();

function addCharacter() {
  if (!isOwner) { alert("権限がありません"); return; }

  const world = document.getElementById("worldInput").value.trim();
  const name  = document.getElementById("nameInput").value.trim();
  const age   = document.getElementById("ageInput").value.trim();
  const gender= document.getElementById("genderInput").value.trim();
  const height= document.getElementById("heightInput").value.trim();
  const weight= document.getElementById("weightInput").value.trim();
  const tags  = document.getElementById("tagsInput").value.trim().split(/\s+/);
  const url   = document.getElementById("urlInput").value.trim();
  const notes = document.getElementById("notesInput").value.trim();
  const now = firebase.firestore.Timestamp.now();

  db.collection("characters").add({ world, name, age, gender, height, weight, tags, url, notes, created: now, updated: now })
    .then(() => loadCharacters())
    .catch(e => alert("キャラの保存に失敗しました: " + e.message));
}

function loadCharacters() {
  const list = document.getElementById("charList");
  list.innerHTML = "";
  db.collection("characters").orderBy("created", "desc").get().then(snap => {
    snap.forEach(doc => {
      const d = doc.data();
      const card = document.createElement("div");
      card.className = "card";
      const details = document.createElement("details");
      const summary = document.createElement("summary");
      summary.textContent = d.name + "（" + d.world + "）";
      details.appendChild(summary);

      const content = document.createElement("div");
      content.innerHTML = `
        <p>年齢：${d.age}</p>
        <p>性別：${d.gender}</p>
        <p>身長：${d.height}</p>
        <p>体重：${d.weight}</p>
        <p>タグ：${(d.tags||[]).map(t=>'#'+t).join(' ')}</p>
        <p>備考：${d.notes}</p>
        <p><small>登録：${formatDate(d.created)} | 更新：${formatDate(d.updated)}</small></p>
      `;
      if (d.url) {
        const a = document.createElement("a");
        a.href = d.url;
        a.target = "_blank";
        a.textContent = "🔗 リンク";
        a.className = "link";
        content.appendChild(a);
      }

      if (isOwner) {
        const btnEdit = document.createElement("button");
        btnEdit.textContent = "編集";
        btnEdit.onclick = () => editCharacter(doc.id, d);
        const btnDel = document.createElement("button");
        btnDel.textContent = "削除";
        btnDel.onclick = () => { db.collection("characters").doc(doc.id).delete().then(loadCharacters); };
        content.appendChild(btnEdit);
        content.appendChild(btnDel);
      }

      details.appendChild(content);
      card.appendChild(details);
      list.appendChild(card);
    });
  });
}

function editCharacter(id, d) {
  document.getElementById("worldInput").value = d.world;
  document.getElementById("nameInput").value = d.name;
  document.getElementById("ageInput").value = d.age;
  document.getElementById("genderInput").value = d.gender;
  document.getElementById("heightInput").value = d.height;
  document.getElementById("weightInput").value = d.weight;
  document.getElementById("tagsInput").value = (d.tags||[]).join(" ");
  document.getElementById("urlInput").value = d.url;
  document.getElementById("notesInput").value = d.notes;

  document.getElementById("formArea").scrollIntoView();
  const btnUpdate = document.createElement("button");
  btnUpdate.textContent = "更新";
  btnUpdate.onclick = () => {
    const now = firebase.firestore.Timestamp.now();
    db.collection("characters").doc(id).update({
      world: document.getElementById("worldInput").value.trim(),
      name: document.getElementById("nameInput").value.trim(),
      age: document.getElementById("ageInput").value.trim(),
      gender: document.getElementById("genderInput").value.trim(),
      height: document.getElementById("heightInput").value.trim(),
      weight: document.getElementById("weightInput").value.trim(),
      tags: document.getElementById("tagsInput").value.trim().split(/\s+/),
      url: document.getElementById("urlInput").value.trim(),
      notes: document.getElementById("notesInput").value.trim(),
      updated: now
    }).then(() => loadCharacters());
  };
  document.getElementById("formArea").appendChild(btnUpdate);
}

function filterCharacters() {
  const kw = document.getElementById("searchInput").value.toLowerCase();
  document.querySelectorAll(".card").forEach(c => {
    const t = c.textContent.toLowerCase();
    c.style.display = t.includes(kw) ? "inline-block" : "none";
  });
}

function formatDate(ts) {
  return ts && ts.toDate ? ts.toDate().toLocaleString() : "";
}
