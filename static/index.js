// index.html

const indexModel = {
    // fetch 景點資料
    async fetchAttractions(URL){
        try {
            const response = await fetch(URL);
            const result = await response.json();
            return result
        } catch (error) {
            console.error("Error loading attractions:", error);
        } 
    },
    // fetch 分類種類
    async fetchCategories(){
        try{
            const response = await fetch("/api/categories");
            const result = await response.json();
            return result
        }
        catch (error) {
                console.error("Error loading categories:", error);
        }
    },
    // fetch MRT資料
    async fetchMRT(){
        try{
        const response = await fetch("/api/mrts");
        const result = await response.json();
        return result
        }
        catch (error){
            console.error("Error loading MRTs:", error);
        }
    }
};

const indexView = {
    // listBar左右滑動按鈕效果
    bindListbarBtm(){
        const listbarRightBtm = document.getElementById('listbarRightBtm');
        const listBarListContainer = document.getElementById('listBarListContainer');

        listbarRightBtm?.addEventListener('click',()=>{
            listBarListContainer.scrollBy({
                left: 200,
                behavior: "smooth"
            });   
        });
        const listbarLeftBtm = document.getElementById('listbarLeftBtm');

        listbarLeftBtm?.addEventListener('click',()=>{
            listBarListContainer.scrollBy({
                left: -200,
                behavior: "smooth"
            });   
        });
    } ,  
    // listbar 滑鼠滾輪滑動效果
    bindListBarListContainer(){
        const listBarListContainer = document.getElementById('listBarListContainer');

        listBarListContainer?.addEventListener("wheel", (e) => {
        e.preventDefault(); 
        listBarListContainer.scrollLeft += e.deltaY;
        }, { passive: false });
    },
    // 在 attractionsGroup 新增景點方塊
    addAttraction(attraction) {
        const attractionsGroup = document.getElementById("attractionsGroup");

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
    },
    //  沒有搜尋結果畫面
    noResult(){
        const attractionsGroup = document.getElementById("attractionsGroup");

        attractionsGroup.innerHTML = "<p>沒有符合搜索的結果</p>";
    },
    observer: null,
    // 新增 Observer
    addNewObserver(){
        let attractions = document.querySelectorAll(".attraction");
        if (attractions.length > 0) {
        indexView.observer.observe(attractions[attractions.length - 1]);
        }
    },
    // Observer效果
    observerEffect(){
        indexView.observer = new IntersectionObserver((entries) => {
        let lastAttraction = entries[0];
        
        if (!lastAttraction.isIntersecting) return;
        indexView.observer.unobserve(lastAttraction.target);
        indexController.loadAttractions();
        },{
            rootMargin: "300px",
            threshold:0
        });
    },
    // 綁定 search 事件
    bindSearch(){
        const searchForm = document.getElementById("searchForm");
        const searchInput = document.getElementById("searchInput");

        searchForm?.addEventListener("submit", (e) => {
            e.preventDefault();
            indexController.search();
            searchInput.value = "";
        });
    },
    // 新增種類
    addCategory(category){
        const categorySelectorPanel = document.getElementById("categorySelectorPanel");

        const item = document.createElement("div");
        item.className = "categoryselector_category_item";

        const text = document.createElement("div");
        text.className = "categoryselector_category_item_text";
        text.textContent = category;

        item.appendChild(text);

        categorySelectorPanel.appendChild(item);
    },
    // 綁定 category 開啟按鈕
    bindCategorySelectorBtn(){
        const categorySelectorBtn = document.getElementById("categorySelectorBtn");
        const categorySelectorPanel = document.getElementById("categorySelectorPanel");
        const categorySelectorOverlay = document.getElementById("categorySelectorOverlay");

        categorySelectorBtn?.addEventListener("click", (e) => {
        categorySelectorPanel.classList.toggle("active");
        categorySelectorOverlay.classList.toggle("active");
        });
    },
    // 綁定 category 背景
    bindCategorySelectorOverlay(){
        const categorySelectorOverlay = document.getElementById("categorySelectorOverlay");
        const categorySelectorPanel = document.getElementById("categorySelectorPanel");

        categorySelectorOverlay?.addEventListener("click", () => {
            categorySelectorPanel.classList.remove("active");
            categorySelectorOverlay.classList.remove("active");
        });
    },
    // 綁定 category panel 內按鈕事件
    bindCategorySelectorPanel(){
        const categorySelectorPanel = document.getElementById("categorySelectorPanel");
        const categorySelectorBtnText = document.getElementById("categorySelectorBtnText");
        const categorySelectorOverlay = document.getElementById("categorySelectorOverlay");

        categorySelectorPanel?.addEventListener("click", (e) => {
            const item = e.target.closest(".categoryselector_category_item");
            if (!item) return;

            const text = item.querySelector(
                ".categoryselector_category_item_text"
            );

            categorySelectorBtnText.textContent = text.textContent + " ▼";
            categorySelectorPanel.classList.remove("active");
            categorySelectorOverlay.classList.remove("active");

            indexController.search();
        });
    },
    // 新增 MRT 種類
    addMRT(MRT) {
        const listBarListContainer = document.getElementById('listBarListContainer');

        const div = document.createElement("div");
        div.className = "listbar_container_listcontainer_listitem";

        div.innerHTML = `
            <div class="listbar_container_listcontainer_listitem_text">
                    ${MRT}
            </div>
        `;
        listBarListContainer.appendChild(div);
    },
    // 綁定 MRT list 內按鈕事件
    bindMRTList(){
        const searchInput = document.getElementById("searchInput");
        const listBarListContainer = document.getElementById('listBarListContainer');

        listBarListContainer?.addEventListener("click", (e) => {
        const item = e.target.closest(".listbar_container_listcontainer_listitem");
        if (!item) return;

        const text = item.querySelector(
            ".listbar_container_listcontainer_listitem_text"
        );
        searchInput.value = text.textContent.trim();

        indexController.search();
        });
    }
};

export const indexController = {
    nextPage: 0,
    isLoading: false,
    currentCategory: "",
    currentKeyword: "",
    init(){
        const attractionsGroup = document.getElementById("attractionsGroup");
        const categorySelectorPanel = document.getElementById("categorySelectorPanel");
        const listBarListContainer = document.getElementById('listBarListContainer');

        indexView.bindListbarBtm();
        indexView.bindListBarListContainer();
        if(attractionsGroup){
            indexController.loadAttractions();
            indexView.observerEffect();
        };
        indexView.bindSearch();
        if(categorySelectorPanel){
            indexController.loadCategories();
        };
        indexView.bindCategorySelectorBtn();
        indexView.bindCategorySelectorOverlay();
        indexView.bindCategorySelectorPanel();
        if(listBarListContainer){
            indexController.loadMRT();
            indexView.bindMRTList();
        };
    },
    async loadAttractions() {
        try{
        if (indexController.isLoading || indexController.nextPage === null) return;
        indexController.isLoading = true;

        const params = new URLSearchParams({page: indexController.nextPage});

        if (indexController.currentCategory) {params.append("category", indexController.currentCategory)};
        if (indexController.currentKeyword){ params.append("keyword", indexController.currentKeyword)};
        const URL = `/api/attractions?${params.toString()}`
        const result = await indexModel.fetchAttractions(URL);

        if (result.message) {
            indexView.noResult();
            indexController.nextPage = null;
            return;
        }

        result.data.forEach(attraction => {
            indexView.addAttraction(attraction);
        });
        indexView.addNewObserver();
        indexController.nextPage = result.nextPage;

        } catch (error) {
        console.error("Error loading attractions:", error);
        } 
        finally {
        indexController.isLoading = false;
        };
        
    },
    search(){
        const searchInput = document.getElementById("searchInput");
        const categorySelectorBtnText = document.getElementById("categorySelectorBtnText");
        const attractionsGroup = document.getElementById("attractionsGroup");


        indexController.currentKeyword = searchInput.value.trim();
        indexController.currentCategory =
            categorySelectorBtnText.textContent.replace(" ▼", "").trim();

        if (indexController.currentCategory === "全部分類") {
            indexController.currentCategory = "";
        }

        indexController.nextPage = 0;
        attractionsGroup.innerHTML = "";
        indexController.loadAttractions();
    },
    async loadCategories() {
        try {
            const result = await indexModel.fetchCategories();
            result.data.forEach(category => {
                indexView.addCategory(category)
            });
        } catch (error) {
                console.error("Error loading categories:", error);
        } 
    },
    async loadMRT() {
    try {
        const result = await indexModel.fetchMRT();

        result.data.forEach(MRT => {
            indexView.addMRT(MRT)
        });
    } catch (error) {
        console.error("Error loading MRT:", error);
    } 
}

};