// 驗證改變登入

const AuthModel = {
    // 確認是否登入
    async authorization(){
            try{
            const url = "/api/user/auth"
            const res = await fetch(url,{
            method:"GET",
            headers:{
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            },
            });
            const result = await res.json()
            const data = result.data
            return data
        }catch(error){
            console.log('authError:',error);
            return false
        }
    },
    // 登入帳號
    async put(data) {
        const url = "/api/user/auth"
        try{
            const res = await fetch(url,{
                method:"PUT",
                headers:{
                    'Content-Type':'application/json'
                },
                body:data
            });
            const result = await res.json()
            return result
        }catch(error){
            console.log('loginError:',error);
        }
  },
    // 註冊帳號
    async post(data) {
        const url = "/api/user"
        try{
            const res = await fetch(url,{
            method:"POST",
            headers:{
                'Content-Type':'application/json'
            },
            body:data
            });
            const result = await res.json();
            return result
        }catch(error){
            console.log('singupError',error);
        }
    }
};

const AuthView = {
    // 註冊視窗錯誤訊息
    loginErrorMessege(msg){
        const dialogMainContaineerLogin = document.getElementById("dialogMainContaineerLogin");

        const errorMsg = document.querySelector(".dialog_main_containeer_msg")
        if(errorMsg){
        errorMsg.textContent = msg;
        return
        }
        const div = document.createElement("div");
        div.className = "dialog_main_containeer_msg";
        div.textContent = msg;
        dialogMainContaineerLogin.appendChild(div);
    },
    // 登入視窗錯誤訊息
    signupErrorMessege(msg){
        const dialogMainContaineerSignup = document.getElementById("dialogMainContaineerSignup");

        const errorMsg = document.querySelector(".dialog_main_containeer_msg")
        if(errorMsg){
            errorMsg.textContent = msg;
            return
        }
        const div = document.createElement("div");
        div.className = "dialog_main_containeer_msg";
        div.textContent = msg;
        dialogMainContaineerSignup.appendChild(div);
    }
}

export const AuthController = {
    isLoggedIn:false,
    userId:null,
    userName:null,
    userEmail:null,
    // 確認是否登入
    async init(){
        AuthController.login();
        AuthController.signin();

        const userData = await AuthModel.authorization()
        if (userData) {
        AuthController.isLoggedIn = true;
        AuthController.userId = userData.id;
        AuthController.userName = userData.name;
        AuthController.userEmail = userData.email;
        return true
        } else {
        AuthController.isLoggedIn = false;
        AuthController.userId = null;
        AuthController.userName = null;
        AuthController.userEmail = null;
        return false
        };

    },
    // 登入帳號
    login(){
    const loginForm = document.getElementById("loginForm");
    const loginEmail = document.getElementById("loginEmail");
    const loginPassword = document.getElementById("loginPassword") ;
    loginForm?.addEventListener("submit",async(e) =>{
    e.preventDefault();
    const errorMsg = document.querySelector(".dialog_main_containeer_msg")
    errorMsg?.remove();
    if (loginEmail.value.trim() === ""){
        AuthView.loginErrorMessege("請填入登入信箱")
        return
    }
    if (loginPassword.value.trim() === ""){
        AuthView.loginErrorMessege("請填入登入密碼")
        return
    }
    let email = loginEmail.value.trim();
    let password = loginPassword.value.trim();
    const data =  {
    "email": email,
    "password": password
    };
    const jsonString = JSON.stringify(data);
        const result = await AuthModel.put(jsonString);
        if(result.error){
        const message = result.message
        AuthView.loginErrorMessege(message)
        };
        if(result.token){
        const token = result.token
        localStorage.setItem("token", token);
        loginForm.reset();
        alert("登入成功！")
        location.reload();
        };
    });
    },
    // 註冊帳號
    signin(){
        const signupForm = document.getElementById("signupForm");
        const singupName = document.getElementById("singupName");
        const singupEmail = document.getElementById("singupEmail");
        const singupPassword = document.getElementById("singupPassword");
        signupForm?.addEventListener("submit",async(e) =>{
        e.preventDefault();
        const errorMsg = document.querySelector(".dialog_main_containeer_msg")
        if(errorMsg){
            errorMsg.remove();
        };
        if (singupName.value.trim() === ""){
            AuthView.signupErrorMessege("請填入註冊姓名")
            return
        }
        if (singupEmail.value.trim() === ""){
            AuthView.signupErrorMessege("請填入註冊信箱")
            return
        }
        if (singupPassword.value.trim() === ""){
            AuthView.signupErrorMessege("請填入註冊密碼")
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
        const result = await AuthModel.post(jsonString)
        if(result.error){
            const message = result.message
            AuthView.signupErrorMessege(message)
        };
        if(result.ok){
            signupForm.reset();
            AuthView.signupErrorMessege("註冊成功！")
        };
        });
    },
    // 登出
      logout() {
        let answer = confirm('確定要登出嗎？');
        if(!answer){
            return
        }else{
        localStorage.removeItem("token");
        location.reload();
        }
    }
}
