import { AuthController } from "./authorization.js";
import { navController } from "./navigation.js";
import { indexController } from "./index.js";
import { attractionController } from "./attractions.js";
import { bookingController } from "./booking.js";
import { thankyouController } from "./thankyou.js";

// 不同頁面執行順序
async function app() {
  const isAuth = await AuthController.init();
  navController.init();

  const homePage = document.getElementById("attractionsGroup");
  const attractionPage = document.getElementById(
        "attractionsIntroduceProfileForm"
        );
  const bookingPage = window.location.pathname === "/booking";
  const thankPage = window.location.pathname === "/thankyou";

  if(homePage){
    indexController.init();
  };
  if(attractionPage){
    attractionController.init();
  };


  if(bookingPage){
    if(!isAuth){
      window.location.href="/"
      return
    }
    bookingController.init();
  };
  if(thankPage){
    if(!isAuth){
      window.location.href="/"
      return
    }
    thankyouController.init();
  }
}

app();