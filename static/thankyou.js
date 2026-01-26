// 訂單完成，感謝頁面
const thankyouView = {
    // 渲染感謝頁訂單編號
    renderOrderNumber(orderNumber){
        const thankyouOrderNumber = document.querySelector(".thankyou_ordernumber");
        if (!orderNumber) {
            thankyouOrderNumber.textContent = "查無訂單";
            return;
        }
        thankyouOrderNumber.textContent = orderNumber;
    },
    // 返回鍵綁事件
    bindThankyouBtn(){
        const thankyouBtn = document.querySelector(".thankyou_btn");
        thankyouBtn?.addEventListener("click",()=>{
            window.location.href = "/"
        })
    }
}
export const thankyouController = {
    init(){
        thankyouController.renderThankyou()
    },
    renderThankyou(){
        const params = new URLSearchParams(window.location.search);
        const orderNumber = params.get("number");
        thankyouView.renderOrderNumber(orderNumber);
        thankyouView.bindThankyouBtn();
    }
}
