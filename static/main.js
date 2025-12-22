// listBar左右滑動按鈕效果
const listbarRightBtm = document.getElementById('listbarRightBtm');
const listbarLeftBtm = document.getElementById('listbarLeftBtm');
const listBarListContainer = document.getElementById('listBarListContainer');

listbarRightBtm.addEventListener('click',()=>{
    listBarListContainer.scrollBy({
        left: 200,
        behavior: "smooth"
    });   
});
listbarLeftBtm.addEventListener('click',()=>{
    listBarListContainer.scrollBy({
        left: -200,
        behavior: "smooth"
    });   
});


//attraction
let nextPage = 0;
let isLoading = false;

let currentCategory = "";
let currentKeyword = "";

let attractions = document.querySelectorAll(".attraction");

const attractionsGroup = document.getElementById("attractionsGroup");



function addAttraction(attraction) {
const div = document.createElement("div");
div.className = "attraction";

div.innerHTML = `
    <div class="attraction_container">
    <img class="attraction_container_img" src="${attraction.images[0] || ''}">
    <div class="attraction_container_name">
        <div class="attraction_container_name_info">
        <div class="attraction_container_name_info_text">${attraction.name}</div>
        </div>
    </div>
    </div>
    <div class="attraction_details">
    <div class="attraction_details_info">
        <div class="attraction_container_details_info_MRT">${attraction.mrt || ''}</div>
        <div class="attraction_container_details_info_category">${attraction.category || ''}</div>
    </div>
    </div>
`;
attractionsGroup.appendChild(div);
console.log(`Next Page:${nextPage}`)
}

async function loadAttractions() {
    if (isLoading || nextPage === null) return;
    isLoading = true;

    try {
        const params = new URLSearchParams({
        page: nextPage
        });

        if (currentCategory) {params.append("category", currentCategory)};
        if (currentKeyword){ params.append("keyword", currentKeyword)};

        const response = await fetch(`/api/attractions?${params.toString()}`);
        const result = await response.json();

        if (result.message) {
            attractionsGroup.innerHTML = "<p>沒有符合搜索的結果</p>";
            nextPage = null;
            return;
        }

        result.data.forEach(addAttraction);
        attractions = document.querySelectorAll(".attraction");
        if (attractions.length > 0) {
        observer.observe(attractions[attractions.length - 1]);
        }

        nextPage = result.nextPage;
    } catch (error) {
        console.error("Error loading attractions:", error);
    } finally {
        isLoading = false;
    }
    
}

loadAttractions();

const observer = new IntersectionObserver((entries) => {
  let lastAttraction = entries[0];
  
  if (!lastAttraction.isIntersecting) return;
  observer.unobserve(lastAttraction.target);
  loadAttractions();
  
},{
    rootMargin: "300px",
    threshold:0
});





//search
const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
function search(){
    currentKeyword = searchInput.value.trim();
    currentCategory =
        categorySelectorBtnText.textContent.replace(" ▼", "").trim();

    if (currentCategory === "全部分類") {
        currentCategory = "";
    }

    nextPage = 0;
    attractionsGroup.innerHTML = "";
    loadAttractions();
};

searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  search()
  
  searchInput.value = "";
});

// category selector

const categorySelectorBtn = document.getElementById("categorySelectorBtn");
const categorySelectorBtnText = document.getElementById("categorySelectorBtnText");
const categorySelectorPanel = document.getElementById("categorySelectorPanel");
const categorySelectorOverlay = document.getElementById("categorySelectorOverlay");

async function loadCategories() {
  try {
    const response = await fetch("/api/categories");
    const result = await response.json();

    result.data.forEach(category => {
      const item = document.createElement("div");
      item.className = "categoryselector_category_item";

      const text = document.createElement("div");
      text.className = "categoryselector_category_item_text";
      text.textContent = category;

      item.appendChild(text);

      categorySelectorPanel.appendChild(item);
    });

  } catch (error) {
        console.error("Error loading categories:", error);
    } 
}

loadCategories();

categorySelectorBtn.addEventListener("click", (e) => {
  categorySelectorPanel.classList.toggle("active");
  categorySelectorOverlay.classList.toggle("active");
});

categorySelectorOverlay.addEventListener("click", () => {
    categorySelectorPanel.classList.remove("active");
    categorySelectorOverlay.classList.remove("active");
});


categorySelectorPanel.addEventListener("click", (e) => {
    const item = e.target.closest(".categoryselector_category_item");
    if (!item) return;

    const text = item.querySelector(
        ".categoryselector_category_item_text"
    );

    categorySelectorBtnText.textContent = text.textContent + " ▼";
    categorySelectorPanel.classList.remove("active");
    categorySelectorOverlay.classList.remove("active");

    search();
});

// MRT
function addMRT(MRT) {
const div = document.createElement("div");
div.className = "listbar_container_listcontainer_listitem";

div.innerHTML = `
    <div class="listbar_container_listcontainer_listitem_text">
              ${MRT}
    </div>
`;
listBarListContainer.appendChild(div);
}

async function loadMRT() {
    try {
        const response = await fetch("/api/mrts");
        const result = await response.json();

        result.data.forEach(MRT => {
            addMRT(MRT)
        });
    } catch (error) {
        console.error("Error loading MRT:", error);
    } 
}

loadMRT();


listBarListContainer.addEventListener("click", (e) => {
    const item = e.target.closest(".listbar_container_listcontainer_listitem");
    if (!item) return;

    const text = item.querySelector(
        ".listbar_container_listcontainer_listitem_text"
    );
    searchInput.value = text.textContent.trim();

    search();
});

// login
const loginBtn = document.getElementById("loginBtn")
const dialogLogin = document.getElementById("dialogLogin")
const dialogSignup = document.getElementById("dialogSignup")
const dialogOverlay = document.getElementById("dialogOverlay")
const signupLink = document.getElementById("signupLink")
const loginLink = document.getElementById("loginLink")
const dialogLoginCloseBtn = document.getElementById("dialogLoginCloseBtn")
const dialogSogunCloseBtn = document.getElementById("dialogSogunCloseBtn")

// signin

loginBtn.addEventListener("click", (e) => {
  dialogLogin.classList.toggle("active");
  dialogOverlay.classList.toggle("active");
});

loginLink.addEventListener("click", (e) => {
  dialogLogin.classList.toggle("active");
  dialogSignup.classList.remove("active");
});

signupLink.addEventListener("click", (e) => {
  dialogSignup.classList.toggle("active");
  dialogLogin.classList.remove("active");
});

dialogOverlay.addEventListener("click", () => {
    dialogLogin.classList.remove("active");
    dialogSignup.classList.remove("active");
    dialogOverlay.classList.remove("active");
});

dialogLoginCloseBtn.addEventListener("click", () => {
    dialogLogin.classList.remove("active");
    dialogSignup.classList.remove("active");
    dialogOverlay.classList.remove("active");
});

dialogSogunCloseBtn.addEventListener("click", () => {
    dialogLogin.classList.remove("active");
    dialogSignup.classList.remove("active");
    dialogOverlay.classList.remove("active");
});

