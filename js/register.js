import { BASE_URL } from "./config.js";

document.getElementById("register-button").disabled = true;

document.getElementById("password").addEventListener("input", toggleRegisterButton);
document.getElementById("password-check").addEventListener("input", toggleRegisterButton);

document.getElementById("email-check-button").addEventListener("click", function () {
    const email = document.getElementById("email").value;
    checkDuplicatedEmail(email)
})


document.getElementById("register-button").addEventListener("click", function () {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const nickname = document.getElementById("nickname").value;

    register(email, password, nickname);
  });

async function checkDuplicatedEmail(email) {
    const response = await fetch(`${BASE_URL}/api/v1/auth/duplicated?email=${email}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: 'include',
        });

    const data = await response.json();
    console.log(data)
    if (data.is_duplicated){
        console.log("중복된 이메일입니다.")
    }
    else {
        const checkButton = document.querySelector("#email-check-button");
        checkButton.disabled = true;
    }

}


function toggleRegisterButton() {
    const password = document.getElementById("password").value;
    const passwordCheck = document.getElementById("password-check").value;
    const checkButton = document.getElementById("email-check-button");

    document.getElementById("register-button").disabled = password !== passwordCheck || !checkButton.disabled;
}


async function register(email, password, nickname) {
    try {
        const response = await fetch(`${BASE_URL}/api/v1/auth/general-register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify({ email, password, nickname })
        });

        window.location.href = "main.html";
        
    }
    catch (error) {
        console.log("회원가입에 실패했습니다.")
      }
}
