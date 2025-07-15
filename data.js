const db = firebase.firestore();
const charList = document.getElementById("charList");

function addCharacter() {
  const name = document.getElementById("nameInput").value;
  const age = document.getElementById("ageInput").value;
  const gender = document.getElementById("genderInput").value;
  const height = document.getElementById("heightInput").value;
  const weight = document.getElementById("weightInput").value;
  const notes = document.getElementById("notesInput").value;
  const created = new Date();
  const updated = new Date();

  firebase.auth().onAuthStateChanged((user) => {
    if (!user || user.uid !== "XlWqWCKnchXAbY73Lc3jrtEVlVk2") {
      alert("保存できません（権限なし）");
      return;
    }

    db.collection("characters").add({
      name,
      age,
      gender,
      height,
      weight,
      notes,
      created,
      updated,
    }).then(() => {
      clearForm();
      loadCharacters();
    }).catch((error) => {
      alert("キャラの保存に失敗しました: " + error.message);
    });
  });
}

function loadCharacters() {
  db.collection("characters").orderBy("created", "desc").get().then((querySnapshot) => {
    charList.innerHTML = "";
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const id = doc.id;
      const div = document.createElement("div");
      div.className = "card";

      const details = document.createElement("details");
      const summary = document.createElement("summary");
      summary.textContent = data.name;
      details.appendChild(summary);

      const content = document.createElement("div");
      content.innerHTML = `
        <p>年齢: ${data.age}</p>
        <p>性別: ${data.gender}</p>
        <p>身長: ${data.height}</p>
        <p>体重: ${data.weight}</p>
        <p>備考: ${data.notes}</p>
        <p style="font-size: 0.8em; color: #ccc;">登録日: ${formatDate(data.created)} / 更新日: ${formatDate(data.updated)}</p>
      `;

      firebase.auth().onAuthStateChanged((user) => {
        if (user && user.uid === "XlWqWCKnchXAbY73Lc3jrtEVlVk2") {
          const editBtn = document.createElement("button");
          editBtn.textContent = "編集";
          editBtn.onclick = () => editCharacter(id, data);
          const deleteBtn = document.createElement("button");
          deleteBtn.textContent = "削除";
          deleteBtn.onclick = () => deleteCharacter(id);
          content.appendChild(editBtn);
          content.appendChild(deleteBtn);
        }
      });

      details.appendChild(content);
      div.appendChild(details);
      charList.appendChild(div);
    });
  });
}

function editCharacter(id, data) {
  document.getElementById("nameInput").value = data.name;
  document.getElementById("ageInput").value = data.age;
  document.getElementById("genderInput").value = data.gender;
  document.getElementById("heightInput").value = data.height;
  document.getElementById("weightInput").value = data.weight;
  document.getElementById("notesInput").value = data.notes;

  const form = document.getElementById("formArea");
  const updateBtn = document.createElement("button");
  updateBtn.textContent = "更新";
  updateBtn.onclick = () => {
    const updated = new Date();
    db.collection("characters").doc(id).update({
      name: document.getElementById("nameInput").value,
      age: document.getElementById("ageInput").value,
      gender: document.getElementById("genderInput").value,
      height: document.getElementById("heightInput").value,
      weight: document.getElementById("weightInput").value,
      notes: document.getElementById("notesInput").value,
      updated
    }).then(() => {
      loadCharacters();
      clearForm();
      updateBtn.remove();
    });
  };
  form.appendChild(updateBtn);
}

function deleteCharacter(id) {
  if (confirm("このキャラクターを削除しますか？")) {
    db.collection("characters").doc(id).delete().then(() => {
      loadCharacters();
    });
  }
}

function clearForm() {
  document.getElementById("nameInput").value = "";
  document.getElementById("ageInput").value = "";
  document.getElementById("genderInput").value = "";
  document.getElementById("heightInput").value = "";
  document.getElementById("weightInput").value = "";
  document.getElementById("notesInput").value = "";
}

function formatDate(timestamp) {
  if (!timestamp) return "";
  const date = timestamp.toDate ? timestamp.toDate() : timestamp;
  return date.toLocaleDateString() + " " + date.toLocaleTimeString();
}

function filterCharacters() {
  const keyword = document.getElementById("searchInput").value.toLowerCase();
  const cards = document.querySelectorAll(".card");
  cards.forEach(card => {
    const text = card.textContent.toLowerCase();
    card.style.display = text.includes(keyword) ? "inline-block" : "none";
  });
}
