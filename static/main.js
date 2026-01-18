// 1. navigation(login+signup)
// 2. index.html 效果與渲染
// 3. attraction.html 效果與渲染
// 4. 傳送 token

// navigation
const loginBtn = document.getElementById("loginBtn")
const bookingBtn = document.getElementById("bookingBtn")
const loginText = document.querySelector(".nav_div_container_button_text_login")
const dialogLogin = document.getElementById("dialogLogin")
const dialogSignup = document.getElementById("dialogSignup")
const dialogOverlay = document.getElementById("dialogOverlay")
const signupLink = document.getElementById("signupLink")
const loginLink = document.getElementById("loginLink")
const dialogLoginCloseBtn = document.getElementById("dialogLoginCloseBtn")
const dialogSignupCloseBtn = document.getElementById("dialogSignupCloseBtn")
const loginForm = document.getElementById("loginForm")
const loginEmail = document.getElementById("loginEmail")
const loginPassword = document.getElementById("loginPassword") 
const signupForm = document.getElementById("signupForm")
const singupName = document.getElementById("singupName")
const singupEmail = document.getElementById("singupEmail")
const singupPassword = document.getElementById("singupPassword")  
const dialogMainContaineerLogin = document.getElementById("dialogMainContaineerLogin")
const dialogMainContaineerSignup = document.getElementById("dialogMainContaineerSignup")

let isLoggedIn = false;
let userId = "";
let userName = "";
let userEmail = "";

// 切換登入/登出按鈕
if(loginBtn){
loginBtn.addEventListener("click", (e) => {
    if (isLoggedIn) {
      logout();
    } else {
      openLoginDialog();
    }
});
}

function updateLoginButton() {
  if (!loginBtn) return;

  if (isLoggedIn) {
    loginText.textContent = "登出";
  } else {
    loginText.textContent = "登入/註冊";
  }
}

function openLoginDialog() {
  dialogLogin.classList.add("active");
  dialogOverlay.classList.add("active");
}

// 登出
function logout() {
  let answer = confirm('確定要登出嗎？');
  if(!answer){
    return
  }else{
  localStorage.removeItem("token");
  location.reload();
  }
}

// show dialog
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
    signupForm.reset();
    loginForm.reset();
    const errorMsgs = document.querySelectorAll(".dialog_main_containeer_msg");
    errorMsgs.forEach(msg => msg.remove());
    dialogLogin.classList.remove("active");
    dialogSignup.classList.remove("active");
    dialogOverlay.classList.remove("active");
});
}
if(dialogLoginCloseBtn){
dialogLoginCloseBtn.addEventListener("click", () => {
    signupForm.reset();
    loginForm.reset();
    const errorMsgs = document.querySelectorAll(".dialog_main_containeer_msg");
    errorMsgs.forEach(msg => msg.remove());
    dialogLogin.classList.remove("active");
    dialogSignup.classList.remove("active");
    dialogOverlay.classList.remove("active");
});
}
if(dialogSignupCloseBtn){
dialogSignupCloseBtn.addEventListener("click", () => {
    signupForm.reset();
    loginForm.reset();
    const errorMsgs = document.querySelectorAll(".dialog_main_containeer_msg");
    errorMsgs.forEach(msg => msg.remove());
    dialogLogin.classList.remove("active");
    dialogSignup.classList.remove("active");
    dialogOverlay.classList.remove("active");
});
}

// 登入註冊訊息
function signupErrorMessege(msg){
  const errorMsg = document.querySelector(".dialog_main_containeer_msg")
  if(errorMsg){
    div.textContent = msg;
    return
  }
  const div = document.createElement("div");
  div.className = "dialog_main_containeer_msg";
  div.textContent = msg;
  dialogMainContaineerSignup.appendChild(div);
}

function loginErrorMessege(msg){
    const errorMsg = document.querySelector(".dialog_main_containeer_msg")
    if(errorMsg){
    div.textContent = msg;
    return
  }
  const div = document.createElement("div");
  div.className = "dialog_main_containeer_msg";
  div.textContent = msg;
  dialogMainContaineerLogin.appendChild(div);
}

//Authorization
async function authorization(){
    try{
    const url = "/api/user/auth"
    const res = await fetch(url,{
      method:"GET",
      headers:{
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      },
    });
    const result = await res.json()
    data = result.data
    if (data) {
      isLoggedIn = true;
      userId = data.id;
      userName = data.name;
      userEmail = data.email;
      console.log(`isLoggedIn:${isLoggedIn}`)
      updateLoginButton();
      return true
    } else {
      isLoggedIn = false;
      userId = "";
      userName = "";
      userEmail = "";
      updateLoginButton();
      console.log(`isLoggedIn:${isLoggedIn}`)
      return false
    }

  }catch(error){
    console.log('authError:',error);
    isLoggedIn = false;
    userId = "";
    userName = "";
    userEmail = "";
    updateLoginButton();
    console.log(`isLoggedIn:${isLoggedIn}`)
    return false
  }
}

async function authRender() {
  const isAuth = await authorization();
  const bookingPage = window.location.pathname === "/booking";
  const thankPage = window.location.pathname === "/thankyou"
  if(bookingPage){
    if(!isAuth){
      window.location.href="/"
      return
    }
    renderBooking();
  };
  if(thankPage){
    if(!isAuth){
      window.location.href="/"
      return
    }
    renderThankyou();
  }

}

authRender();


//login
if (loginForm){
loginForm.addEventListener("submit",async(e) =>{
  e.preventDefault();
  const errorMsg = document.querySelector(".dialog_main_containeer_msg")
  if(errorMsg){
    errorMsg.remove();
  };
  if (loginEmail.value.trim() === ""){
    loginErrorMessege("請填入登入信箱")
    return
  }
  if (loginPassword.value.trim() === ""){
    loginErrorMessege("請填入登入密碼")
    return
  }
  let email = loginEmail.value.trim();
  let password = loginPassword.value.trim();
  const data =  {
  "email": email,
  "password": password
  };
  const jsonString = JSON.stringify(data);

  const url = "/api/user/auth"
  try{
    const res = await fetch(url,{
      method:"PUT",
      headers:{
        'Content-Type':'application/json'
      },
      body:jsonString
    });
    const result = await res.json();
    if(result.error){
      message = result.message
      loginErrorMessege(message)
    };
    if(result.token){
      token = result.token
      localStorage.setItem("token", token);
      loginForm.reset();
      alert("登入成功！")
      location.reload();
    };
  }catch(error){
    console.log('loginError:',error);
  }
});
}

// signup
if (signupForm){
signupForm.addEventListener("submit",async(e) =>{
  e.preventDefault();
  const errorMsg = document.querySelector(".dialog_main_containeer_msg")
  if(errorMsg){
    errorMsg.remove();
  };
  if (singupName.value.trim() === ""){
    signupErrorMessege("請填入註冊姓名")
    return
  }
  if (singupEmail.value.trim() === ""){
    signupErrorMessege("請填入註冊信箱")
    return
  }
  if (singupPassword.value.trim() === ""){
    signupErrorMessege("請填入註冊密碼")
    return
  }
  let name = singupName.value.trim();
  let email = singupEmail.value.trim();
  let password = singupPassword.value.trim();
  const data =  {
  "name": name,
  "email": email,
  "password": password
  };
  const jsonString = JSON.stringify(data);

  const url = "/api/user"
  try{
    const res = await fetch(url,{
      method:"POST",
      headers:{
        'Content-Type':'application/json'
      },
      body:jsonString
    });
    const result = await res.json();
    if(result.error){
      message = result.message
      signupErrorMessege(message)
    }
    if(result.ok){
      signupForm.reset();
      signupErrorMessege("註冊成功！")
    }
  }catch(error){
    console.log('singupError',error);
  }
});
}

// bookingBtn
bookingBtn.addEventListener('click',()=>{
      if (isLoggedIn) {
      window.location.href = "/booking";
    } else {
      openLoginDialog();
    }
  });

// index.html
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

// listbar 滑鼠滾輪滑動效果
if(listBarListContainer){
listBarListContainer.addEventListener("wheel", (e) => {
  e.preventDefault(); 
  listBarListContainer.scrollLeft += e.deltaY;
}, { passive: false });
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


// attraction.html
// atraction 分頁，選擇上下半天，價格變化
const attractionForm = document.getElementById(
  "attractionsIntroduceProfileForm"
);

if(attractionForm){
  const morningRadio = document.getElementById(
  "attractionsIntroduceProfileFormTimeMorning"
);
const afternoonRadio = document.getElementById(
  "attractionsIntroduceProfileFormTimeAfternoon"
);
const priceValue = document.querySelector(
  ".attractionsintroduce_profile_form_price_value"
);

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

if(attractionForm){
  attractionForm.addEventListener("submit", (e) => {
  e.preventDefault();

  // 先確認有無登入
  if (!isLoggedIn ){
    openLoginDialog();
    return
  }

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

  postBooking(bookingData);

});
};

async function postBooking(data) {
  url = "/api/booking"
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
      console.log("postBookingError:",error);
      if(result.message ==="未登入系統，拒絕存取"){
        openLoginDialog();
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


// render booking page
  // 取得預定資料
async function fetchBooking(){
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
      data = result.data
      return data
    }catch(error){
      console.log("fetchBookingError:", error)
      return null
    }
}
  // 插入預定頁面
async function bookingHtml(data) {
  const main = document.querySelector(".main")
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
}
  //  綁定預定事件
function bookingEvent(data){
  // 刪除按鈕
    const bookingDeleteBtn = document.getElementById("bookingDeleteBtn");
    if (!bookingDeleteBtn) return;
    bookingDeleteBtn.addEventListener("click", () => {
      if (!isLoggedIn ){
      openLoginDialog();
      return
      }
      const isDelete = deleteBooking();
      if(isDelete){location.reload();};
    });
    // 表單事件
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
      await createOrder(prime, bookingName, bookingEmail, bookingPhone,data);
    });
  });
}
  // 渲染預定畫面
async function renderBooking(){
  const data = await fetchBooking()
  const booked = await bookingHtml(data)
  if(booked){
      initToppay();
      bookingEvent(data);
  }; 
}

// 刪除預定資料
async function deleteBooking() {
  url = "/api/booking"
  try{
    const res = await fetch(url,{
      method: "DELETE",
      headers:{
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      },
    })
    const result = await res.json()
    if(result.error){
      console.log("deleteBookingError:",error);
      if(result.message ==="未登入系統，拒絕存取"){
        openLoginDialog();
        return
      }
      return
    }
    if(result.ok){
      return {isDelete:true}      
    }
  }catch(error){
    console.log("deleteBookingError:",error);
  }
  
}

// Toppay
function initToppay(){
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
};
// Oder
async function createOrder(prime, bookingName, bookingEmail, bookingPhone,data){
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
      console.log("createOrder:",error);
      if(result.message ==="未登入系統，拒絕存取"){
        openLoginDialog();
        return
      }
      if(result.message ==="訂單建立失敗"){
        alert("訂單建立失敗，請確認輸入資料是否正確");
        return
      }
    }
    if(result.data){
    deleteBooking();
    const order_number = result.data.number
    window.location.href = `/thankyou?number=${order_number}`;
    };
  }catch(error){
    console.log("createOrder:",error);
  }

}

// Thankyou
function renderThankyou(){
  const params = new URLSearchParams(window.location.search);
  const orderNumber = params.get("number");
  const thankyouOrderNumber = document.querySelector(".thankyou_ordernumber");
  const thankyouBtn = document.querySelector(".thankyou_btn");
  if (!orderNumber) {
    thankyouOrderNumber.textContent = "查無訂單";
    return;
  }
  thankyouOrderNumber.textContent = orderNumber;
  thankyouBtn.addEventListener("click",()=>{
    window.location.href = "/"
  })
};