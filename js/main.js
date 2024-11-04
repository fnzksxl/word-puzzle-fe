import { BASE_URL } from "./config.js";

let key = 0;
const puzzleList = document.getElementById("puzzle-list");
const loadMoreButton = document.getElementById("load-more-button");
const userInfoDiv = document.getElementById("user-info");

async function loadPuzzles(currentKey) {
  try {
    const url = currentKey 
      ? `${BASE_URL}/api/v1/puzzle/paginated?key=${currentKey}` 
      : `${BASE_URL}/api/v1/puzzle/paginated`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: 'include',

    });
    if (response.status === 404){
      loadMoreButton.disabled = true;
      throw new Error("더 이상 불러올 퍼즐이 없습니다.");
    }
    if (!response.ok) {
      throw new Error("퍼즐 목록을 불러오는 데 실패했습니다.");
    }
    console.log(response)
    const data = await response.json();
    displayPuzzles(data.item);

    if (data.next === null) {
      loadMoreButton.textContent = "더 이상 불러올 퍼즐이 없습니다";
      loadMoreButton.disabled = true;
    } else {
      loadMoreButton.disabled = false;
    }
    
    return data.next;
  } catch (error) {
    console.error(error.message);
  }
}

function displayPuzzles(puzzles) {
  puzzles.forEach(puzzle => {
    const puzzleItem = document.createElement("div");
    puzzleItem.className = "puzzle-item";

    const puzzleImage = document.createElement("img");
    puzzleImage.src = "../assets/thumbnail.png";
    puzzleImage.alt = `${puzzle.name} 썸네일`;
    puzzleItem.appendChild(puzzleImage);

    const puzzleName = document.createElement("div");
    puzzleName.className = "puzzle-item-name";
    puzzleName.textContent = puzzle.name;
    
    const solvedCount = document.createElement("div");
    solvedCount.className = "puzzle-solved-count";
    solvedCount.textContent = `| 풀린 횟수: ${puzzle.solved}`;
    
    puzzleItem.appendChild(solvedCount);
    puzzleItem.appendChild(puzzleName);

    puzzleItem.addEventListener("click", () => {
      window.location.href = `puzzle.html?id=${puzzle.id}`;
    });

    puzzleList.appendChild(puzzleItem);
  });
}

document.getElementById("puzzle-size-7").addEventListener("click", async () => {
  window.location.href = "newpuzzle.html?size=7";
});

document.getElementById("puzzle-size-8").addEventListener("click", async () => {
  window.location.href = "newpuzzle.html?size=8";
});

document.getElementById("puzzle-size-9").addEventListener("click", async () => {
  window.location.href = "newpuzzle.html?size=9";
});

document.getElementById("puzzle-size-10").addEventListener("click", async () => {
  window.location.href = "newpuzzle.html?size=10";
});

loadMoreButton.addEventListener("click", async () => {
  key = await loadPuzzles(key);
});

document.getElementById("login-button").addEventListener("click", () => {
  window.location.href = "login.html";
});

async function logout() {
  try {
    const response = await fetch(`${BASE_URL}/api/v1/auth/logout`, {
      method: "GET",
      headers: {
          "Content-Type": "application/json",
      },
      credentials: 'include',
    });
  
    if (response.ok){
      window.location.reload()
    }
    else{
      console.log("로그아웃에 실패했습니다.")
    }
    
  } catch (error) {
    console.log("로그아웃에 실패했습니다.")
  }
}

document.getElementById("logout-button").addEventListener("click", () => {
  logout();
});

function displayUserInfo(nickname, solved) {
  userInfoDiv.innerHTML = `
      <h2>${nickname}님</h2>
      <p>풀이한 문제 개수: ${solved}개</p>
  `;
}


async function checkUser() {
  try {
      const response = await fetch(`${BASE_URL}/api/v1/auth/get-user`, {
          method: "GET",
          headers: {
              "Content-Type": "application/json",
          },
          credentials: 'include',
      });

      if (response.ok) {
          const userData = await response.json();
          const loginButton = document.getElementById("login-button")
          const logoutButton = document.getElementById("logout-button")

          logoutButton.style.display = 'inline-block';
          loginButton.style.display = 'none';
          
          displayUserInfo(userData.nickname, userData.solved);
      }
  } catch (error) {
      console.error("사용자 정보를 가져오는 데 실패했습니다:", error.message);
  }
}


checkUser();
loadPuzzles(key).then(nextKey => {
  key = nextKey;
});
