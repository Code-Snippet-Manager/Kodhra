// When user is offline save the draft in IndexDB and when user is online save the draft in the server.
// TODO: Make a function to save the draft in the server
// TODO: Make a function to save the draft in the IndexDB

let currentId = null;
async function saveDraftOnServer(data) {
  if (!navigator.onLine) return;
  const title = data.title ?? "";
  const description = data.description ?? "";
  const content = data.content ?? "";
  const category = data.category ?? "";
  const tags = data.tags?.split(",").map((tag) => tag.trim()) ?? [];
  try {
    const url = currentId ? `/drafts/${currentId}` : "/drafts";
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ title, description, content, category, tags }),
    });
    const result = await res.json();
    if (!res.ok) {
      console.log("Data Not Saved To Server.");
    } else {
      currentId = result.data._id;
      console.log("Data Saved To Server.");
    }
  } catch (error) {
    console.log(error);
  }
}

const result = indexedDB.open("draftDB", 1);
let db;
result.onupgradeneeded = function (e) {
  db = e.target.result;
  if (!db.objectStoreNames.contains("drafts")) {
    db.createObjectStore("drafts", { keyPath: "id", autoIncrement: true });
  }
};

result.onsuccess = function (e) {
  db = e.target.result;
};
result.onerror = function (e) {
  console.log(e.target.error);
};

// function for save data on indexDB
function saveDraftOnIndexDB(data) {
  if (!db) {
    console.log("IndexDB Database Not Found.");
    return;
  }
  const title = data.title ?? "";
  const description = data.description ?? "";
  const content = data.content ?? "";
  const category = data.category ?? "";
  const tags = data.tags?.split(",").map((tag) => tag.trim()) ?? [];
  const createAt = new Date();
  const tx = db.transaction("drafts", "readwrite");
  const store = tx.objectStore("drafts");
  const request = store.add({ title, description, content, category, tags, createAt });
  request.onsuccess = () => console.log("Draft saved successfully");
  request.onerror = () => console.log("Error saving draft");
}

function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

function decideWhereToSave() {
  if (!editor) return;
  const titleElValue = document.getElementById("title1");
  const desElValue = document.getElementById("des");
  const catElValue = document.getElementById("category");
  const tagElValue = document.getElementById("tags");
  const folderElValue = document.getElementById("folderName1");
  const visibilityValue = document.getElementById("visibility");
  const readme_titleValue = document.getElementById("readme_title1");
  const readme_desciptionValue = document.getElementById("readme_desciption1");
  editor.on(
    "inputRead",
    debounce(() => {
      (cm, change) => {
        let data = {
          title: titleElValue.value,
          description: desElValue.value,
          content: cm.getValue(),
          category: catElValue.value,
          tags: tagElValue.value,
          folder: folderElValue.value,
          visibility: visibilityValue.value,
          readme_title: readme_titleValue.value,
          readme_desciption: readme_desciptionValue.value,
        };

        if (!navigator.onLine) return saveDraftOnIndexDB(data);
        saveDraftOnServer(data);
      };
    }, 1000)
  );
}
