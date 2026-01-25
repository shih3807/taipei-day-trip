// 預定頁面

import { AuthController } from "./authorization.js";
import { navView } from "./navigation.js";

const bookingModel = {
    // 取得預定資料
    async fetchBooking(){
        try{
        const url = "/api/booking"
        const res = await fetch(url,{
            method:"GET",
            headers:{
            "Authorization":`Bearer ${localStorage.getItem("token")}`
            },
        });
        const result = await res.json()
        if(result.error){
            console.log(`fetchBookingError:${result.message}`)
            return null
        }
        const data = result.data
        return data
        }catch(error){
        console.log("fetchBookingError:", error)
        return null
        }
    },
    // 刪除預定資料
    async fetchDeleteBooking(){
        const url = "/api/booking"
        try{
            const res = await fetch(url,{
            method: "DELETE",
            headers:{
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            },
            })
            const result = await res.json()
            return result
        }catch(error){
            console.log("deleteBookingError:",error);
        }
    },
    // 建立訂單
    async createOrder(prime, bookingName, bookingEmail, bookingPhone,data){
        const url = "/api/orders";
        const attraction_id = data.attraction.id;
        const attraction_name = data.attraction.name;
        const attraction_address = data.attraction.address;
        const attraction_image = data.attraction.image;
        const date = data.date;
        const time = data.time;
        const price = data.price;

    try{
        const res = await fetch(url,{
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
            "prime": prime,
            "order": {
            "price": price,
            "trip": {
                "attraction": {
                "id": attraction_id,
                "name": attraction_name,
                "address": attraction_address,
                "image": attraction_image
                },
                "date": date,
                "time": time
            },
            "contact": {
                "name": bookingName,
                "email": bookingEmail,
                "phone": bookingPhone
            }
            }
        })
        });
        const result = await res.json()
        if(result.error){
        console.log("createOrder:",result.message);
        if(result.message ==="未登入系統，拒絕存取"){
            navView.openLoginDialog();
            return
        }
        if(result.message ==="訂單建立失敗"){
            alert("訂單建立失敗，請確認輸入資料是否正確");
            return
        }
        }
        if(result.data){
        bookingController.deleteBooking();
        const order_number = result.data.number
        window.location.href = `/thankyou?number=${order_number}`;
        };
    }catch(error){
        console.log("createOrder:",error);
    }
    }
};

const bookingView = {
    // 插入預定頁面
    bookingHtml(data) {
    const main = document.querySelector(".main");
    const userName = AuthController.userName;
    if (!data){
        main.innerHTML = `
        <div class="booking_container">
        <div class="headline">
            <div class="headline_text">您好，${userName}，待預定的行程如下：</div>
        </div>
        <div class="booking_none">
            <div class="booking_none_text">目前沒有任何待預訂的行程</div>
        </div>
        </div>
        `
        return false
    }
    const attraction_name = data.attraction.name;
    const attraction_address = data.attraction.address;
    const attraction_image = data.attraction.image;
    const date = data.date;
    const time = data.time;
    const price = data.price;
    main.innerHTML = `
    <div class="booking_container">
    <div class="headline"><div class="headline_text">您好，${userName}，待預定的行程如下：</div></div>
    <div class="booking">
        <button class="booking_delete" id="bookingDeleteBtn"><img src="/static/image/delete.png"></button>
        <div class="booking_img_container">
        <img src="${attraction_image}">
        </div>
        <div class="booking_information">
        <div class="booking_information_name"><div class="booking_information_name_text">台北一日遊：${attraction_name}</div></div>
        <div class="booking_information_date"><div class="booking_information_title">日期：</div><div class="booking_information_text">${date}</div></div>
        <div class="booking_information_time"><div class="booking_information_title">時間：</div><div
            class="booking_information_text">${(time === "morning")? "早上 9 點到中午 12 點":"下午 1 點到下午 4 點"}</div></div>
        <div class="booking_information_price"><div class="booking_information_title">費用：</div><div
            class="booking_information_text">新台幣 ${price} 元</div></div>
        <div class="booking_information_address"><div class="booking_information_title">地點：</div><div
            class="booking_information_text">${attraction_address}</div></div>
        </div>
    </div>
    </div>
    <hr>
    <form class="booking_form" id="booking_form">
        <div class="booking_form_info_container">
        <div class="booking_form_info"><div class="booking_form_info_text">您的聯絡資訊</div></div>
        <div class="booking_form_info_name">
            <label class="booking_form_info_name_lable" for="bookingFormInfoNameImput">聯絡姓名：</label>
            <input class="booking_form_info_name_imput" id="bookingFormInfoNameImput" type="text" autocomplete="name">
        </div>
        <div class="booking_form_info_email">
            <label class="booking_form_info_email_lable" for="bookingFormInfoEmailImput">聯絡信箱：</label>
            <input class="booking_form_info_email_imput" id="bookingFormInfoEmailImput" type="text" autocomplete="email">
        </div>
        <div class="booking_form_info_phone">
            <label class="booking_form_info_phone_lable" for="bookingFormInfoPhoneImput">手機號碼：</label>
            <input class="booking_form_info_phone_imput" id="bookingFormInfoPhoneImput" type="tel" autocomplete="tel">
        </div>
        <div class="booking_form_info_remind">
            <div class="booking_form_info_remind_text">請保持手機暢通，準時到達，導覽人員將用手機與您聯繫，務必留下正確的聯絡方式。</div>
        </div>
        </div>
        <hr>
        <div class="booking_form_visa_container">
        <div class="booking_form_visa">
            <div class="booking_form_visa_text">信用卡付款資訊</div>
        </div>
        <div class="booking_form_visa_number">
            <label class="booking_form_visa_number_lable" >卡片號碼：</label>
            <div class="booking_form_visa_number_imput" id="card-number"></div>
        </div>
        <div class="booking_form_visa_exp">
            <label class="booking_form_visa_exp_lable">過期時間：</label>
            <div class="booking_form_visa_exp_imput" id="card-expiration-date"></div>
        </div>
        <div class="booking_form_visa_cvv">
            <label class="booking_form_visa_cvv_lable">驗證密碼：</label>
            <div class="booking_form_visa_cvv_imput" id="card-ccv"></div>
        </div>
        </div>
        <hr>
        <div class="booking_form_buttom_container">
        <div class="booking_form_price">
            <div class="booking_form_price_text">總價：新台幣 ${price} 元</div>
        </div>
        <button type="submit" class="booking_form_btn">
            <span>確認訂購並付款<span>
        </button>
        </div>
    </form>
    `
    return true
    },
    // 刪除按鈕
    bindDeleteBtn(){
        const bookingDeleteBtn = document.getElementById("bookingDeleteBtn");
        if (!bookingDeleteBtn) return;
        bookingDeleteBtn.addEventListener("click", () => {
            if (!AuthController.isLoggedIn ){
                navController.navView.openLoginDialog();
                return
            }
            const isDelete = bookingController.bookingController.deleteBooking();
            if(isDelete){location.reload();};
        });
    },
    // 表單事件
    bindBookingForm(data){
        const bookingForm = document.getElementById("booking_form");
        bookingForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const bookingName = document.getElementById("bookingFormInfoNameImput").value;
        const bookingEmail = document.getElementById("bookingFormInfoEmailImput").value;
        const bookingPhone = document.getElementById("bookingFormInfoPhoneImput").value;
        
        // 確認聯絡資料是否正確 
        if (!bookingName) {
        alert("請填寫聯絡姓名");
        return;
        };
        if (!bookingEmail) {
        alert("請填寫聯絡信箱");
        return;
        };
        if (!bookingPhone) {
        alert("請填寫聯絡電話");
        return;
        };
        
        // 確認付款資料是否正確
        const tappayStatus = TPDirect.card.getTappayFieldsStatus();
        if (tappayStatus.canGetPrime === false) {
            alert("請填寫完整付款資料");
            return
        }

        // 呼叫 TapPay 取得 prime
        TPDirect.card.getPrime(async function (result) {
        if (result.status !== 0) {
            alert("信用卡資料錯誤，請確認");
            return;
        }
        const prime = result.card.prime;
        await bookingModel.createOrder(prime, bookingName, bookingEmail, bookingPhone,data);
        });
    });
    },
    //  綁定預定事件
    bookingEvent(data){
        // 刪除按鈕
        bookingView.bindDeleteBtn();
        // 表單事件
        bookingView.bindBookingForm(data)
    },
    // Toppay
    initToppay(){
        const appId = 166486;
        const appKey = "app_R1FNHXMT4XfHf1uZgPBHUG1ZyTFwe5HuAvrIWewO4Ed73mYPp99pMuQaZc3u"
        TPDirect.setupSDK(appId, appKey, 'sandbox');
        
        TPDirect.card.setup({
            fields: {
                number: {
                    element: document.getElementById('card-number'),
                    placeholder: '**** **** **** ****'
                },
                expirationDate: {
                    element: document.getElementById('card-expiration-date'),
                    placeholder: 'MM / YY'
                },
                ccv: {
                    element: document.getElementById('card-ccv'),
                    placeholder: 'CCV'
                }
            },
            styles: {
                'input': {
                        'font-family': '"Noto Sans TC", sans-serif',
                        'font-weight': '500',
                        'font-style': 'Medium',
                        'font-size': '16px',
                        'line-height': '16px',
                        'letter-spacing': '0%',
                        'vertical-align': 'middle',
                        'color': '#000000'

                },
                '::placeholder': {
                    'color':'#757575'
                },
                '.invalid': {
                    'border-color': 'red'
                },
            },
        });
        return true;
    }
};

export const bookingController = {
    init(){
        bookingController.renderBooking();
    },
    // 渲染預定畫面
    async renderBooking(){
        const data = await bookingModel.fetchBooking()
        const booked = await bookingView.bookingHtml(data)
        if(booked){
            bookingView.initToppay();
            bookingView.bookingEvent(data);
        }; 
    },
    // 刪除預定資料
    async deleteBooking() {
    try{
        const result = await bookingModel.fetchDeleteBooking();
        if(result.error){
        console.log("deleteBookingError:",error);
        if(result.message ==="未登入系統，拒絕存取"){
            navController.navView.openLoginDialog();
            return
        }
        return
        }
        if(result.ok){
        return true      
        }
    }catch(error){
        console.log("deleteBookingError:",error);
    }
    
    }
};
 
 

