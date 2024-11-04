import { BASE_URL } from "./config.js";

document.getElementById("login-button").addEventListener("click", function () {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    login(email, password);
  });

document.getElementById("register-button").addEventListener("click", function () {
  window.location.href = "register.html";
});


document.getElementById("google-login-button").addEventListener("click", async () => {
  const clientId = "639700898145-445d540qksvfnm3tg29mkht55ufkfeuv.apps.googleusercontent.com";
  const redirectUri = "https://127.0.0.1:5500/html/login.html"; 
  const scope = "email profile";
  const responseType = "code"; 
  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=${responseType}&scope=${scope}`;

  window.location.href = url;
});


async function login(email, password) {
  try {
    const response = await fetch(`${BASE_URL}/api/v1/auth/general-login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: 'include',
      body: JSON.stringify({ email, password })
    });
    console.log(response.headers)
    if (!response.ok) {
      throw new Error("로그인 실패!");
    }
    window.location.href = "main.html";
    
  } catch (error) {
    console.log("로그인에 실패했습니다.")
  }
}

const urlParams = new URLSearchParams(window.location.search);
const code = urlParams.get("code"); 

if (code) {
  console.log(code)
  const url = `${BASE_URL}/api/v1/auth/oauth-register/google/callback?code=${encodeURIComponent(code)}`;
  console.log(url);
  const response = await fetch(`${BASE_URL}/api/v1/auth/oauth-register/google/callback?code=${encodeURIComponent(code)}`, {
    method: "GET",
    credentials: "include",
  });

  if (response.ok) {
    const data = await response.json();
    console.log("로그인 성공:", data);
    window.location.href = "main.html";
  } else {
    console.error("로그인 실패:", await response.json());
    alert("로그인에 실패했습니다. 다시 시도해 주세요.");
  }
}