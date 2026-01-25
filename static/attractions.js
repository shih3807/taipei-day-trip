// 景點分頁

import { AuthController } from "./authorization.js";
import { navView } from "./navigation.js";

const attractionsModel = {
    // 新增預定資料
    async postBooking(data) {
        const url = "/api/booking"
        try{
            const res = await fetch(url,{
            method: "POST",
            headers:{
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            },
            body: JSON.stringify(data)
            })
            const result = await res.json()
            if(result.error){
            console.log("postBookingError:",result.message );
            if(result.message ==="未登入系統，拒絕存取"){
                navView.openLoginDialog();
                return
            }
            return
            }
            if(result.ok){
            window.location.href = "/booking";
            }
        }catch(error){
            console.log("postBookingError:",error);
        }
    },
    // fetch 景點資料
    async fetchAttraction(attractionId){
        try{
            const response = await fetch(`/api/attraction/${attractionId}`);
            const result = await response.json();
            return result
        } catch (error) {
            console.error("Error loading attraction page:", error);
        }
    }

};

const attractionView = {
    imgElements: [],
    indicators: [],
    currentIndex: 0,

    // 綁定早上下午選項，影響收費價格
    bindRadio(){
        const morningRadio = document.getElementById(
        "attractionsIntroduceProfileFormTimeMorning"
        );
        const afternoonRadio = document.getElementById(
        "attractionsIntroduceProfileFormTimeAfternoon"
        );
        const priceValue = document.querySelector(
        ".attractionsintroduce_profile_form_price_value"
        );

        morningRadio?.addEventListener("change", () => {
            if (morningRadio.checked) {
            priceValue.textContent = "新台幣 2000 元";
            }
        });
        afternoonRadio?.addEventListener("change", () => {
            if (afternoonRadio.checked) {
            priceValue.textContent = "新台幣 2500 元";
            }
        });
    },
    // 綁定表單送出事件
    bindAttractionForm(){
        const attractionForm = document.getElementById(
        "attractionsIntroduceProfileForm"
        );

      attractionForm?.addEventListener("submit", (e) => {
        e.preventDefault();

        // 先確認有無登入
        if (!AuthController.isLoggedIn ){
            navView.openLoginDialog();
            return
        }

        const attractionId = window.location.pathname.split("/").pop();
        const dateInput = document.getElementById("attractionsIntroduceProfileFormDateInput");
        const date = dateInput.value;

        // 確認有選日期
        if (!date) {
            alert("請先選擇預訂日期");
            return;
        }

        const time = document.getElementById("attractionsIntroduceProfileFormTimeMorning").checked
            ? "morning"
            : "afternoon";
        const price = time === "morning" ? 2000 : 2500

        const bookingData = {
            attractionId: attractionId,
            date: date,
            time: time,
            price: price
        };

        attractionsModel.postBooking(bookingData);
        });
    },
    // 渲染景點文字敘述
    addAttractionText(data){
        const profileName = document.querySelector(".attractionsintroduce_profile_name");
        const profileCategory = document.querySelector(".attractionsintroduce_profile_category");
        const profileMrt = document.querySelector(".attractionsintroduce_profile_MRT");
        const profileDescription = document.querySelector(".attractiondescription_text");
        const profileAddress = document.querySelector(".attractiondescription_address");
        const profileTransport = document.querySelector(".attractiondescription_transport");

        profileName.textContent = data.name;
        profileCategory.textContent = data.category || "";
        profileMrt.textContent = data.mrt || "";
        profileDescription.textContent = data.description || "";
        profileAddress.textContent = data.address || "";
        profileTransport.textContent = data.transport || "";
    },
    // 重新計算投影片
    clearSlide(){
        attractionView.imgElements = [];
        attractionView.indicators = [];
    },
    // 新增圖片
    addImg(url, index){
        const picContainer = document.querySelector(".attractionsintroduce_pic");
        const img = document.createElement("img");
        img.className = "attractionsintroduce_pic_img";
        img.src = url;

        if (index === 0){
            img.style.display="block";
        }else{
            img.style.display="none";
        }
        picContainer.appendChild(img);
        attractionView.imgElements.push(img);
    },
    // 新增投影片指示
    addIndicator(index){
        const indicator = document.createElement("div");
        const indicatorContainer = document.querySelector(".attractionsintroduce_pic_indicator_container");

        indicator.className = "attractionsintroduce_pic_indicator_item";
        indicator.style.flex = 1;
        if (index === 0){ indicator.classList.add("active")};

        indicator.addEventListener("click", () => {
            attractionView.showSlide(index);
        });
        indicatorContainer.appendChild(indicator);
        attractionView.indicators.push(indicator);
    },
    // 新增投影片功能
    initializeSlide() {
        const leftBtn = document.querySelector(".attractionsintroduce_pic_left");
        const rightBtn = document.querySelector(".attractionsintroduce_pic_right");

        leftBtn.addEventListener("click", () => {
            let nextIndex = attractionView.currentIndex - 1;
            if (nextIndex < 0) {
                nextIndex = attractionView.imgElements.length - 1;
            }
            attractionView.showSlide(nextIndex);
        });

        rightBtn.addEventListener("click", () => {
            let nextIndex = attractionView.currentIndex + 1;
            if (nextIndex >= indexView.imgElements.length) nextIndex = 0;
            showSlide(nextIndex);
        });
    },
    // 顯示序號的投影片
    showSlide(index) {
        attractionView.imgElements[attractionView.currentIndex].style.display = "none";
        attractionView.indicators[attractionView.currentIndex].classList.remove("active");

        attractionView.currentIndex = index;

        attractionView.imgElements[attractionView.currentIndex].style.display = "block";
        attractionView.indicators[attractionView.currentIndex].classList.add("active");
    }
};

export const attractionController = {
    init(){
        const attractionForm = document.getElementById(
        "attractionsIntroduceProfileForm"
        );

        attractionView.bindRadio();
        attractionView.bindAttractionForm();
        if(attractionForm){
            attractionController.loadAttractionDetail();
        }


    },
    // 載入景點頁面畫面
    async loadAttractionDetail() {
        const attractionId = window.location.pathname.split("/").pop();
        try {
            const result = await attractionsModel.fetchAttraction(attractionId);

            if (!result.data) {
            console.error("No attraction data");
            return;
            }

            await attractionController.addAttractionDetail(result.data);

            attractionView.initializeSlide();

        } catch (error) {
            console.error("Error loading attraction page:", error);
        }
    },
    // 新增景點資料
    async addAttractionDetail(data) {
        attractionView.addAttractionText(data);
        attractionView.clearSlide();
        data.images.forEach((url, index) => {
            attractionView.addImg(url, index);
            attractionView.addIndicator(index);
        });
    }


}