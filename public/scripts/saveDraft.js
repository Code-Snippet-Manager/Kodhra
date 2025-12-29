// async function getUserDetails() {
//   try {
//     const res = await fetch("/a");
//     const data = await res.json();
//     return data;
//   } catch (error) {
//     throw error;
//   }
// }


// getUserDetails().then((a) => {
//   localStorage.setItem(
//     "data",
//     btoa(unescape(encodeURIComponent(JSON.stringify(a))))
//   );
// });

// const draftDB = indexedDB.open("draftDB", 1);
// let db;
// let currentObjectId = null;

// draftDB.onupgradeneeded = function () {
//   db = draftDB.result;
//   db.createObjectStore("drafts", { keyPath: "id", autoIncrement: true });
// };

// draftDB.onsuccess = (e) => {
//   db = e.target.result;

//   const saveDraft = (db) => {
//     const tx = db.transaction("drafts", "readwrite");
//     const store = tx.objectStore("drafts");
//     const titleEl = document.getElementById("title1")?.value ?? "";
//     const folderEl = document.getElementById("folderName1")?.value ?? "";
//     const desEl = document.getElementById("des")?.value ?? "";
//     const catEl = document.getElementById("category")?.value ?? "";
//     const tagEl = document.getElementById("tags")?.value?.split(",") ?? [];
//     const codeEL = editor?.getValue() ?? "";
//     if (!codeEL) return;

//     if (currentObjectId) {
//       const request = store.put({
//         id: currentObjectId,
//         title: titleEl,
//         folder: folderEl,
//         description: desEl,
//         category: catEl,
//         tags: tagEl,
//         code: codeEL,
//         content: codeEL,
//         author: JSON.parse(
//           atob(unescape(encodeURIComponent(localStorage.getItem("data"))))
//         ),
//       });
//       request.onsuccess = () => console.log("Draft saved successfully");
//       request.onerror = () => console.log("Error saving draft");
//       return;
//     } else {
//       const request = store.add({
//         title: titleEl,
//         folder: folderEl,
//         description: desEl,
//         category: catEl,
//         tags: tagEl,
//         code: codeEL,
//         content: codeEL,
//         author: JSON.parse(
//           atob(unescape(encodeURIComponent(localStorage.getItem("data"))))
//         ),
//         createdAt: new Date().toLocaleString(),
//       });

//       request.onsuccess = () => {
//         currentObjectId = request.result;
//         console.log("Draft saved successfully");
//       };
//       request.onerror = () => console.log("Error saving draft");
//     }
//   };
//   async function getSaveInterval() {
//     const res = await fetch("/settings/list", {
//       method: "GET",
//       credentials: "include",
//       headers: {
//         "content-Type": "application/json",
//       },
//     });
//     if (res.ok) {
//       const data = await res.json();
//       const intervalTime = data.autoSaveInterval;
//       if (intervalTime) {
//         setInterval(() => {
//           saveDraft(db);
//         }, parseInt(intervalTime) * 1000);
//       }
//     }
//   }
//   getSaveInterval();
//   window.onbeforeunload = () => {
//     if (db) saveDraft(db);
//   };

//   function getDraftLen() {
//     return new Promise((resolve, reject) => {
//       const tx = db.transaction("drafts", "readonly");
//       const store = tx.objectStore("drafts");
//       const request = store.count();

//       request.onsuccess = () => {
//         resolve(request.result);
//       };
//       request.onerror = () => {
//         reject(request.error);
//       };
//     });
//   }
//   getDraftLen().then((len) => {
//     let el = document.querySelector(".draft");
//     if (el) {
//       el.textContent = len;
//     }
//   });

//   function getDrafts(db) {
//     const tx = db.transaction("drafts", "readonly");
//     const store = tx.objectStore("drafts");
//     const request = store.getAll();
//     request.onsuccess = () => {
//       const cards = document.getElementById("cards1");
//       const drafts = request.result;
//       const cardss = drafts.sort(
//         (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
//       );
//       if (cardss.length === 0) {
//         cards.innerHTML = `<div class="no-data" style="display:flex; width: 100%; justify-content: center; align-items: center;flex-direction: column; z-index: 9999999999;">
//   <p style="font-size: 1.5em; font-weight: bold;">No Data Found</p>
//   <p>Create a snippet to get started</p>
// </div>`;
//         return;
//       }

//       cards.innerHTML = "";
//       cardss.forEach((card) => {
//         const cardHTML = `
//    <div class="card"
//      tabindex="0"
//      data-menus="draft_Delete, draft_Edit"
//      data-userId="${card.author}"
//      data-contextMenu="true"
//      data-cardName="${card.title}"
//      data-mtype="card"
//      data-id="${card.id}"
//      data-url = "/card/create?${new URLSearchParams({
//        title: card.title,
//        id: card.id,
//        author: card.author,
//        description: card.description,
//        content: card.content,
//        category: card.category,
//        tags: card.tags,
//        userImage: card.userImage,
//        authorName: card.authorName,
//      }).toString()}"
//      ondblclick="window.location.href = this.dataset.url"
//      data-cardauthor="${card.author}">

//     <div class="header-info">
//         <label for="card_${
//           card.id
//         }" style="display: flex; align-items: center; gap: 10px">
//             <img src="${
//               card.userImage && card.userImage.trim()
//                 ? card.userImage
//                 : "https://static.vecteezy.com/system/resources/previews/013/360/247/non_2x/default-avatar-photo-icon-social-media-profile-sign-symbol-vector.jpg"
//             }"
//              onerror="this.src='https://static.vecteezy.com/system/resources/previews/013/360/247/non_2x/default-avatar-photo-icon-social-media-profile-sign-symbol-vector.jpg'"
//              alt="" width="40" height="40" style="border-radius: 50%" />
//             <div class="title">
//                 <h3>
//                     ${card.title?.trim() || "Untitled"}
//                     <span style="font-size: 13px !important; display: block">
//                         ${card.description?.trim() || "No description"}
//                     </span>
//                 </h3>
//                 <div>
//                     <span class="author"><strong>${
//                       card.authorName?.trim() || "Unknown"
//                     }</strong></span>,
//                     <span class="lan">${
//                       card.category?.trim() || "Uncategorized"
//                     }</span>,
//                     <span class="time">${new Date(
//                       card.createdAt ?? new Date()
//                     ).toLocaleString()}</span>
//                 </div>
//             </div>
//         </label>

//         <div class="menu_top"
//              data-id="${card.id}"
//              onclick="openContextMenu(event)"
//              data-userId="${card.author}"
//              data-cardauthor="${card.author}"
//              data-cardName="${card.title}"
//              data-mtype="card"
//              data-url = "/card/create?${new URLSearchParams({
//                title: card.title,
//                id: card.id,
//                author: card.author,
//                description: card.description,
//                content: card.content,
//                category: card.category,
//                tags: card.tags,
//                userImage: card.userImage,
//                authorName: card.authorName,
//              }).toString()}"
//              data-menus="draft_Delete, draft_Edit"
//              data-contextMenu='true'
//              tabindex="0">
//             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
//                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
//                  class="lucide lucide-ellipsis-vertical">
//                 <circle cx="12" cy="12" r="1" />
//                 <circle cx="12" cy="5" r="1" />
//                 <circle cx="12" cy="19" r="1" />
//             </svg>
//         </div>
//     </div>

//     <div class="code" title="${card.content?.trim() || "No content"}">
//         <code>${card.content?.trim() || "No content"}</code>
//     </div>

//     ${
//       (card.tags ?? []).length > 0
//         ? `<div class="tags">
//              ${(card.tags ?? [])
//                .map(
//                  (tag) =>
//                    `<a class="span" href="search?query=${tag}">${
//                      tag?.trim() ?? "Tag"
//                    }</a>`
//                )
//                .join("")}
//            </div>`
//         : ""
//     }

//     <div class="options">
//         <div class="open" tabindex="0">
//             <a href="/card/${card.id ?? ""}"
//                style="display: flex; justify-content: center; align-items: center; gap: 10px; background: var(--accent);">
//                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
//                      stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
//                      class="lucide lucide-badge-info">
//                     <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
//                     <line x1="12" x2="12" y1="16" y2="12" />
//                     <line x1="12" x2="12.01" y1="8" y2="8" />
//                 </svg>
//                 View Details
//             </a>
//         </div>
//     </div>
// </div>`;
//         if (cards) {
//           cards.innerHTML += cardHTML;
//         }
//       });
//     };
//   }

//   getDrafts(db);
// };

// When user is offline save the draft in IndexDB and when user is online save the draft in the server.
// TODO: Make a function to save the draft in the server
// TODO: Make a function to save the draft in the IndexDB

let currentId22 = null;
async function saveDraftOnServer(data) {
  if (!navigator.onLine) return;
  const title = data.title ?? "";
  const description = data.description ?? "";
  const content = data.content ?? "";
  const category = data.category ?? "";
  let tags = [];
  if (typeof data.tags === "string") {
    tags = data.tags?.split(",").map((tag) => tag.trim()) ?? [];
  } else {
    tags = data.tags ?? [];
  }
  try {
    const url = currentId22 ? `/drafts/${currentId22}` : "/drafts";
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
      console.log(result.data || result);
      currentId22 = result.data._id;
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

async function getUserDetails() {
  return fetch("/a", {
    method: "GET",
    credentials: "include",
  }).then((data) => data.json());
}
getUserDetails().then((data) => {
  const encrypted = btoa(JSON.stringify(data));
  localStorage.setItem("yks", encrypted);
});

let indexDBID = null;
// function for save data on indexDB
function saveDraftOnIndexDB(data) {
  if (!db) {
    console.log("IndexDB Database Not Found.");
    return;
  }
  const authorsDetails = JSON.parse(atob(localStorage.getItem("yks")));
  console.log(authorsDetails);
  const title = data.title ?? "";
  const description = data.description ?? "";
  const content = data.content ?? "";
  const category = data.category ?? "";
  const tags = data.tags?.split(",").map((tag) => tag.trim()) ?? [];
  const tx = db.transaction("drafts", "readwrite");
  const store = tx.objectStore("drafts");
  if (indexDBID) {
    const request = store.put({
      id: indexDBID,
      title,
      description,
      content,
      category,
      tags,
      author: {
        ...authorsDetails
      },
      createdAt: new Date().toISOString(),
    });
    request.onsuccess = () => {
      indexDBID = request.result;
      console.log(indexDBID);
    };
    request.onerror = () => console.log("Error saving draft");
  } else {
    const request = store.add({ title, description, content, category, tags, author: { ...authorsDetails }, createdAt: new Date().toISOString() });
    request.onsuccess = () => {
      indexDBID = request.result;
      console.log(indexDBID);
    };
    request.onerror = () => console.log("Error saving draft");
  }
}

function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

function decideWhereToSave(editor) {
  if (!editor) {
    console.log("Editor Not Found!");
    return;
  }

  console.log("Editor Found!");

  const titleElValue = document.getElementById("title1");
  const desElValue = document.getElementById("des");
  const catElValue = document.getElementById("category");
  const tagElValue = document.getElementById("tags");
  const folderElValue = document.getElementById("folderName1");
  const visibilityValue = document.getElementById("visibility");
  const readme_titleValue = document.getElementById("readme_title1");
  const readme_desciptionValue = document.getElementById("readme_desciption1");

  const debouncedSave = debounce((cm) => {
    const data = {
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

    if (!navigator.onLine) {
      saveDraftOnIndexDB(data);
    } else {
      saveDraftOnServer(data);
    }
  }, 1000);

  editor.on("change", (cm) => {
    debouncedSave(cm);
  });
}

window.addEventListener("online", () => {
  if (!db || !indexDBID) return;
  const tx = db.transaction("drafts", "readonly");
  const store = tx.objectStore("drafts");
  const request = store.get(indexDBID);
  request.onsuccess = () => {
    const data = request.result;
    if (!data) return;
    saveDraftOnServer(data);
  };
  const deleteData = store.delete(indexDBID);
  deleteData.onsuccess = () => {
    console.log("Draft deleted successfully");
  };
  deleteData.onerror = () => {
    console.log("Error deleting draft");
  };
  request.onerror = () => {
    console.log("Failed to read draft from IndexedDB");
  };
});
