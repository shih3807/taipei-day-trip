// listBar左右滑動按鈕效果
const listbarRightBtm = document.getElementById('listbarRightBtm');
const listbarLeftBtm = document.getElementById('listbarLeftBtm');
const listBarListContainer = document.getElementById('listBarListContainer');

if(listbarRightBtm){
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
}

//attraction
let nextPage = 0;
let isLoading = false;

let currentCategory = "";
let currentKeyword = "";

let attractions = document.querySelectorAll(".attraction");

const attractionsGroup = document.getElementById("attractionsGroup");



function addAttraction(attraction) {
const a = document.createElement("a");
  a.href = `/attraction/${attraction.id}`;
  a.target = "_blank"; 
  a.className = "attraction";

  a.innerHTML = `
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
attractionsGroup.appendChild(a);
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

if(attractionsGroup){
loadAttractions();
}

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

if(searchForm){
searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  search()
  
  searchInput.value = "";
});
}

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
if(categorySelectorPanel){
loadCategories();
}

if(categorySelectorBtn){
categorySelectorBtn.addEventListener("click", (e) => {
  categorySelectorPanel.classList.toggle("active");
  categorySelectorOverlay.classList.toggle("active");
});
}

if(categorySelectorOverlay){
categorySelectorOverlay.addEventListener("click", () => {
    categorySelectorPanel.classList.remove("active");
    categorySelectorOverlay.classList.remove("active");
});
}

if(categorySelectorPanel){
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
}

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

if(listBarListContainer){
loadMRT();
}

if(listBarListContainer){
listBarListContainer.addEventListener("click", (e) => {
    const item = e.target.closest(".listbar_container_listcontainer_listitem");
    if (!item) return;

    const text = item.querySelector(
        ".listbar_container_listcontainer_listitem_text"
    );
    searchInput.value = text.textContent.trim();

    search();
});
}

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
if(loginBtn){
loginBtn.addEventListener("click", (e) => {
  dialogLogin.classList.toggle("active");
  dialogOverlay.classList.toggle("active");
});
}
if(loginLink){
loginLink.addEventListener("click", (e) => {
  dialogLogin.classList.toggle("active");
  dialogSignup.classList.remove("active");
});
}
if(signupLink){
signupLink.addEventListener("click", (e) => {
  dialogSignup.classList.toggle("active");
  dialogLogin.classList.remove("active");
});
}
if(dialogOverlay){
dialogOverlay.addEventListener("click", () => {
    dialogLogin.classList.remove("active");
    dialogSignup.classList.remove("active");
    dialogOverlay.classList.remove("active");
});
}
if(dialogLoginCloseBtn){
dialogLoginCloseBtn.addEventListener("click", () => {
    dialogLogin.classList.remove("active");
    dialogSignup.classList.remove("active");
    dialogOverlay.classList.remove("active");
});
}
if(dialogSogunCloseBtn){
dialogSogunCloseBtn.addEventListener("click", () => {
    dialogLogin.classList.remove("active");
    dialogSignup.classList.remove("active");
    dialogOverlay.classList.remove("active");
});
}

// listbar 滑鼠滾輪滑動效果
if(listBarListContainer){
listBarListContainer.addEventListener("wheel", (e) => {
  e.preventDefault(); 
  listBarListContainer.scrollLeft += e.deltaY;
}, { passive: false });
}

// atraction 分頁，選擇上下半天，價格變化
const attractionForm = document.getElementById(
  "attractionsIntroduceProfileForm"
);
const morningRadio = document.getElementById(
  "attractionsIntroduceProfileFormTimeMorning"
);
const afternoonRadio = document.getElementById(
  "attractionsIntroduceProfileFormTimeAfternoon"
);
const priceValue = document.querySelector(
  ".attractionsintroduce_profile_form_price_value"
);

if(attractionForm){
morningRadio.addEventListener("change", () => {
  if (morningRadio.checked) {
    priceValue.textContent = "新台幣 2000 元";
  }
});
afternoonRadio.addEventListener("change", () => {
  if (afternoonRadio.checked) {
    priceValue.textContent = "新台幣 2500 元";
  }
});
}

//render attraction page
const attractionId = window.location.pathname.split("/").pop();

async function loadAttractionDetail() {
  try {
    const response = await fetch(`/api/attraction/${attractionId}`);
    const result = await response.json();

    if (!result.data) {
      console.error("No attraction data");
      return;
    }

    await addAttractionDetail(result.data);

    initializeSlide();

  } catch (error) {
    console.error("Error loading attraction page:", error);
  }
}

if(attractionForm){
    loadAttractionDetail();
}

const picContainer = document.querySelector(".attractionsintroduce_pic");
const indicatorContainer = document.querySelector(".attractionsintroduce_pic_indicator_container");
const profileName = document.querySelector(".attractionsintroduce_profile_name");
const profileCategory = document.querySelector(".attractionsintroduce_profile_category");
const profileMrt = document.querySelector(".attractionsintroduce_profile_MRT");
const profileDescription = document.querySelector(".attractiondescription_text");
const profileAddress = document.querySelector(".attractiondescription_address");
const profileTransport = document.querySelector(".attractiondescription_transport");

let imgElements = [];
let indicators = [];

async function addAttractionDetail(data) {
  profileName.textContent = data.name;
  profileCategory.textContent = data.category || "";
  profileMrt.textContent = data.mrt || "";
  profileDescription.textContent = data.description || "";
  profileAddress.textContent = data.address || "";
  profileTransport.textContent = data.transport || "";

  imgElements = [];
  indicators = [];

  return new Promise((resolve) => {
    data.images.forEach((url, index) => {
      const img = document.createElement("img");
      img.className = "attractionsintroduce_pic_img";
      img.src = url;

      if (index === 0){
        img.style.display="block";
      }else{
        img.style.display="none";
      }

      picContainer.appendChild(img);
      imgElements.push(img);

      const indicator = document.createElement("div");
      indicator.className = "attractionsintroduce_pic_indicator_item";
      indicator.style.flex = 1;
      if (index === 0){ indicator.classList.add("active")};

      indicator.addEventListener("click", () => {
        showSlide(index);
      });
      indicatorContainer.appendChild(indicator);
      indicators.push(indicator);

      if (index === data.images.length - 1) resolve();
    });
  });
}

let currentIndex = 0;

function initializeSlide() {
  const leftBtn = document.querySelector(".attractionsintroduce_pic_left");
  const rightBtn = document.querySelector(".attractionsintroduce_pic_right");

  leftBtn.addEventListener("click", () => {
    let nextIndex = currentIndex - 1;
    if (nextIndex < 0) nextIndex = imgElements.length - 1;
    showSlide(nextIndex);
  });

  rightBtn.addEventListener("click", () => {
    let nextIndex = currentIndex + 1;
    if (nextIndex >= imgElements.length) nextIndex = 0;
    showSlide(nextIndex);
  });
}

function showSlide(index) {
  imgElements[currentIndex].style.display = "none";
  indicators[currentIndex].classList.remove("active");

  currentIndex = index;

  imgElements[currentIndex].style.display = "block";
  indicators[currentIndex].classList.add("active");
}
