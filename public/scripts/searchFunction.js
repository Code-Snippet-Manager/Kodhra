const searchv1 = async (query) => {
  let query1 = encodeURIComponent(query);
  let res = await fetch(`/search/json?query=${query1}`);
  let data = await res.json();
  return data;
};
let results = document.getElementById("results");
let list = document.getElementById("results-list");
let searchInput = document.querySelector(".searchResult");
let search1 = document.getElementById("search");

search1.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    const query = search1.value.trim();
    if (query) {
      window.location.href = `/search/json?q=${encodeURIComponent(query)}`;
    }
  }
});

function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

search1.addEventListener(
  "input",
  debounce(() => {
    results.classList.add("active");
    list.textContent = "Loading Suggestions...";
    const query = search1.value.trim();
    if (!query) {
      results.classList.remove("active");
      document.body.classList.remove("active");
      list.innerHTML = "";
      return;
    }
    searchv1(query).then((data) => {
      list.innerHTML = "";
      const noCards = !Array.isArray(data.card) || data.card.length === 0;
      const noFolders = !Array.isArray(data.folder) || data.folder.length === 0;
      if (noCards && noFolders) {
        list.innerHTML = "<span style='color:red'>No Cards Found</span>";
      } else {
        data.card.forEach((card) => {
          const li = document.createElement("li");
          li.innerHTML = `
          <a href="/card/${card._id}" tabindex="0">
           <div class="name">
             <svg xmlns="http://www.w3.org/2000/svg" 
                 width="18" height="18" viewBox="0 0 24 24" 
                 fill="none" stroke="currentColor" 
                 stroke-width="2" stroke-linecap="round" 
                 stroke-linejoin="round" 
                 class="   -search-icon  -search">
              <path d="m21 21-4.34-4.34"/>
              <circle cx="11" cy="11" r="8"/>
            </svg> 
            ${card.title}
            </div>
            <div class="arrow" onclick="applytext(event,'${card.title}')"><svg xmlns="http://www.w3.org/2000/svg"  width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="   -arrow-up-left-icon  -arrow-up-left"><path d="M7 17V7h10"/><path d="M17 17 7 7"/></svg></div>
          </a>`;
          list.appendChild(li);
        });
        data.folder.forEach((e) => {
          const li = document.createElement("li");
          li.innerHTML = `
          <a href="/folder/${e._id}" tabindex="0">
           <div class="name">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="#F7B31B" stroke="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="   -folder-icon  -folder"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg>
            ${e.folderName}
            </div>
            <div class="arrow" onclick="applytext(event,'${e.folderName}')"><svg xmlns="http://www.w3.org/2000/svg"  width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="   -arrow-up-left-icon  -arrow-up-left"><path d="M7 17V7h10"/><path d="M17 17 7 7"/></svg></div>
          </a>`;
          list.appendChild(li);
        });
      }
    });
  }, 500)
);

function applytext(e, t) {
  e.preventDefault();
  e.stopPropagation();
  search1.value = t;
}
document.addEventListener("click", (e) => {
  if (searchInput.contains(e.target) && search1.value !== "") {
    results.classList.add("active");
  } else {
    results.classList.remove("active");
  }
});
