const db = firebase.firestore();

function addCharacter() {
  if (!isOwner) return alert("権限がありません");
  const world = document.getElementById("worldInput").value.trim();
  const name  = document.getElementById("nameInput").value.trim();
  const age   = document.getElementById("ageInput").value.trim();
  const gender= document.getElementById("genderInput").value;
  const height= document.getElementById("heightInput").value.trim();
  const weight= document.getElementById("weightInput").value.trim();
  const tags  = document.getElementById("tagsInput").value.trim().split(/\s+/);
  const url   = document.getElementById("urlInput").value.trim();
  const notes = document.getElementById("notesInput").value.trim();
  const now = firebase.firestore.Timestamp.now();

  db.collection("characters").add({ world, name, age, gender, height, weight, tags, url, notes, created: now, updated: now })
    .then(() => { clearForm(); loadCharacters(); })
    .catch(e => alert("保存失敗: " + e.message));
}

function loadCharacters() {
  const list = document.getElementById("charList");
  list.innerHTML = "";
  const sort = document.getElementById("sortSelect").value;
  let query = db.collection("characters");
  if (sort === "name") query = query.orderBy("name");
  else if (sort === "updated") query = query.orderBy("updated", "desc");
  else query = query.orderBy("created", "desc");

  query.get().then(snap => {
    snap.forEach(doc => {
      const d = doc.data(), id = doc.id;
      const card = document.createElement("div"); card.className = "card";
      const details = document.createElement("details");
      const summary = document.createElement("summary");
      summary.textContent = `${d.name}（${d.world}）`;
      details.appendChild(summary);
      const content = document.createElement("div");
      let html = `<p>年齢：${d.age}</p>
        <p>性別：${d.gender}</p>
        <p>身長：${d.height}</p>
        <p>体重：${d.weight}</p>
        <p>タグ：${(d.tags||[]).map(t=>`#${t}`).join(" ")}</p>
        <p>備考：${d.notes}</p>
        <p><small>登録：${formatDate(d.created)} | 更新：${formatDate(d.updated)}</small></p>`;
      if (d.url) html += `<p><a href="${d.url}" target="_blank" class="link">🔗 リンク</a></p>`;
      content.innerHTML = html;
      if (isOwner) {
        const btnE = document.createElement("button"); btnE.textContent="編集"; btnE.onclick=()=>editCharacter(id,d);
        const btnD = document.createElement("button"); btnD.textContent="削除"; btnD.onclick=()=>{ db.collection("characters").doc(id).delete().then(loadCharacters);};
        content.appendChild(btnE); content.appendChild(btnD);
      }
      details.appendChild(content); card.appendChild(details); list.appendChild(card);
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
  const btnU = document.createElement("button"); btnU.textContent="更新";
  btnU.onclick = () => {
    const now = firebase.firestore.Timestamp.now();
    db.collection("characters").doc(id).update({
      world: document.getElementById("worldInput").value.trim(),
      name: document.getElementById("nameInput").value.trim(),
      age: document.getElementById("ageInput").value.trim(),
      gender: document.getElementById("genderInput").value,
      height: document.getElementById("heightInput").value.trim(),
      weight: document.getElementById("weightInput").value.trim(),
      tags: document.getElementById("tagsInput").value.trim().split(/\s+/),
      url: document.getElementById("urlInput").value.trim(),
      notes: document.getElementById("notesInput").value.trim(),
      updated: now
    }).then(()=>{ clearForm(); loadCharacters(); btnU.remove(); });
  };
  document.getElementById("formArea").appendChild(btnU);
}

function clearForm(){
  ["world","name","age","gender","height","weight","tags","url","notes"].forEach(id=>
    document.getElementById(id+"Input").value="");
}

function filterCharacters(){
  const kw = document.getElementById("searchInput").value.toLowerCase();
  document.querySelectorAll(".card").forEach(c=> c.style.display = c.textContent.toLowerCase().includes(kw) ? "inline-block": "none");
}

function formatDate(ts){ return ts && ts.toDate?ts.toDate().toLocaleString():""; }
