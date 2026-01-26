// 橫列物件效果

import { AuthController } from "./authorization.js";

export const navView = {
  // 切換登入/登出按鈕文字
  updateLoginButton() {
    const loginBtn = document.getElementById("loginBtn");
    const loginText = document.querySelector(".nav_div_container_button_text_login");

    if (!loginBtn) return;
    if (AuthController.isLoggedIn) {
      loginText.textContent = "登出";
    } else {
      loginText.textContent = "登入/註冊";
    }
  },
  // 開啟彈出視窗
  openLoginDialog() {
    const dialogLogin = document.getElementById("dialogLogin");
    const dialogOverlay = document.getElementById("dialogOverlay");

    dialogLogin?.classList.add("active");
    dialogOverlay?.classList.add("active");
  },
  // 關閉彈出視窗
  closeLoginDialog(){
    const dialogLogin = document.getElementById("dialogLogin");
    const dialogSignup = document.getElementById("dialogSignup");
    const dialogOverlay = document.getElementById("dialogOverlay");
    const loginForm = document.getElementById("loginForm");
    const signupForm = document.getElementById("signupForm");


    signupForm?.reset();
    loginForm?.reset();
    const errorMsgs = document.querySelectorAll(".dialog_main_containeer_msg");
    errorMsgs.forEach(msg => msg.remove());
    dialogLogin.classList.remove("active");
    dialogSignup.classList.remove("active");
    dialogOverlay.classList.remove("active");
  },
  // 綁登入/登出按鈕事件
  bindLoginBtn(){
    const loginBtn = document.getElementById("loginBtn");

    loginBtn?.addEventListener("click", () => {
        if (AuthController.isLoggedIn) {
          AuthController.logout();
        } else {
          navView.openLoginDialog();
        }
    });
  },
  // 綁預訂行程按鈕事件
  bindBookingBtn(){
    const bookingBtn = document.getElementById("bookingBtn");

    bookingBtn?.addEventListener('click',()=>{
      if (AuthController.isLoggedIn) {
        window.location.href = "/booking";
      } else {
        navView.openLoginDialog();
      }
    });
  },
  // 登入連結，連結登入畫面
  bindLoginLink(){
    const loginLink = document.getElementById("loginLink");

    loginLink?.addEventListener("click", (e) => {
      const dialogLogin = document.getElementById("dialogLogin");
      const dialogSignup = document.getElementById("dialogSignup");

      dialogLogin.classList.toggle("active");
      dialogSignup.classList.remove("active");
    });
  },
  // 註冊連結，連結註冊畫面
  bindSignupLink(){
    const signupLink = document.getElementById("signupLink");

    signupLink?.addEventListener("click", (e) => {
      const dialogLogin = document.getElementById("dialogLogin");
      const dialogSignup = document.getElementById("dialogSignup");

      dialogSignup.classList.toggle("active");
      dialogLogin.classList.remove("active");
    });
  },
  // 彈出視窗背景綁事件
  bindDialogOverlay(){
    const dialogOverlay = document.getElementById("dialogOverlay");

    dialogOverlay?.addEventListener("click", () => {
      navView.closeLoginDialog();
    });
  },
  // 登入視窗關閉頁面
  bindDialogLoginCloseBtn(){
    const dialogLoginCloseBtn = document.getElementById("dialogLoginCloseBtn");

    dialogLoginCloseBtn?.addEventListener("click", () => {
      navView.closeLoginDialog();
    });
  },
  // 註冊視窗關閉頁面
  bindDialogSignupCloseBtn(){
    const dialogSignupCloseBtn = document.getElementById("dialogSignupCloseBtn");

    dialogSignupCloseBtn?.addEventListener("click", () => {
        navView.closeLoginDialog();
    });
  }
};

export const navController = {
  async init(){
    navView.updateLoginButton();
    navView.bindLoginBtn();
    navView.bindBookingBtn();
    navView.bindLoginLink();
    navView.bindSignupLink();
    navView.bindDialogOverlay();
    navView.bindDialogLoginCloseBtn();
    navView.bindDialogSignupCloseBtn();
  }
};









