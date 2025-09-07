document.addEventListener("DOMContentLoaded", function () {
  const signUpBtn = document.getElementById("Sign-Up");
  const forgotBtn = document.getElementById("forgot-password");
  const tahaBtn = document.getElementById("taha");
  const activbtn=document.getElementById("active");

  if (signUpBtn) {
    signUpBtn.addEventListener("click", function () {
      window.location.href = "Create Account.html";
    });
  }

  if (forgotBtn) {
    forgotBtn.addEventListener("click", function () {
      window.location.href = "Forgot Password.html";
    });
  }

  if (tahaBtn) {
    tahaBtn.addEventListener("click", function () {
      window.location.href = "Transaction.html";
    });
  }
if(activbtn){
  activbtn.addEventListener("click",function(){
    window.location.href="Home.html";
  });
}

});

  



