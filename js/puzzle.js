import { BASE_URL } from "./config.js";

let puzzleMapData = null;
let puzzleId = null;
let isLoggedIn = false;

function getPuzzleIdFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("id");
}

async function showModal() {
  const modal = document.getElementById("result-modal");
  const modalMessage = modal.querySelector("p");
  const modalTitle = modal.querySelector("h2");
  const puzzleNameContainer = modal.querySelector("#puzzle-name-container");

  puzzleNameContainer.innerHTML = "";

  if (isLoggedIn) {
    modalTitle.textContent = "정답입니다!!";
    modalMessage.textContent = "정답 확인이 완료되었습니다. 다른 퍼즐도 풀어보세요!";
    try {
      const response = await fetch(`${BASE_URL}/api/v1/puzzle/search/${puzzleId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: 'include',
      });
  
      if (!response.ok) {
        throw new Error("퍼즐 데이터를 불러오는 데 실패했습니다.");
      }
    } catch (error) {
      console.log("풀이 퍼즐 수 증가 실패")
    }
  } else {
    modalTitle.textContent = "기록을 저장하고 싶다면? 로그인이 필요합니다!";
    modalMessage.textContent = "로그인 후에는 풀이한 퍼즐 수를 증가시킬 수 있어요!.";
    
  }
  const goToMainButton = document.createElement("button");
    goToMainButton.textContent = "메인 페이지로 돌아가기";
    goToMainButton.onclick = () => {
      window.location.href = "main.html"; 
    };

  puzzleNameContainer.appendChild(goToMainButton);
  modal.style.display = "block"; 
}

function closeModal() {
  const modal = document.getElementById("result-modal");
  modal.style.display = "none";
}

document.getElementById("close-modal").addEventListener("click", closeModal);
document.getElementById("restart-button").addEventListener("click", function() {
  closeModal();
});

async function loadPuzzleDetails() {
  const puzzleId = getPuzzleIdFromURL();
  if (!puzzleId) {
    document.getElementById("puzzle-details").textContent = "퍼즐 ID를 찾을 수 없습니다.";
    return;
  }

  try {
    const response = await fetch(`${BASE_URL}/api/v1/puzzle/search/${puzzleId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error("퍼즐 데이터를 불러오는 데 실패했습니다.");
    }

    const puzzleData = await response.json();
    
    displayPuzzleMap(puzzleData.map)
    displayDescriptions(puzzleData.across, puzzleData.down)
  
    return puzzleData
  } catch (error) {
    console.error(error.message);
    document.getElementById("puzzle-details").textContent = "데이터를 불러오는 중 오류가 발생했습니다.";
  }

}

function displayPuzzleMap(map) {
  const puzzleBody = document.getElementById("puzzle-body");
  puzzleBody.innerHTML = '';

  for (let rowIndex = 0; rowIndex < map.length - 1; rowIndex++) {
    const tr = document.createElement("tr");

    for (let cellIndex = 0; cellIndex < map[rowIndex].length - 1; cellIndex++) {
      const td = document.createElement("td");
      
      td.setAttribute("data-row", rowIndex);
      td.setAttribute("data-col", cellIndex);
      
      if (map[rowIndex][cellIndex] === 0) {
        td.classList.add("black");
      }
      else{
        let input = td.querySelector("input");
        
        if (!input) {
            input = document.createElement("input");
            input.type = "text";
            input.maxLength = 1
            input.classList.add("cell-input");
            input.addEventListener("input", (e) => {
              const value = e.target.value;
              if (!/^[가-힣]$/.test(value)) {
                e.target.value = ''; 
              }
            });
            input.addEventListener("keydown", (event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                document.getElementById("answer-check").click();
              }
            });
            td.appendChild(input);
          }

          input.style.display = "block";
          input.focus();
      }    
      
      tr.appendChild(td);
    };

    puzzleBody.appendChild(tr);
  };
  const checkButton = document.getElementById("answer-check");
  checkButton.addEventListener("click", checkAnswers);
}

function checkAnswers() {
  const puzzleBody = document.getElementById("puzzle-body");
  const rows = puzzleBody.querySelectorAll("tr");
  let allDisabled = true;

  rows.forEach((tr, rowIndex) => {
    const cells = tr.querySelectorAll("td");

    cells.forEach((td, cellIndex) => {
      const input = td.querySelector("input");
      
      if (input && !input.disabled) { 
        const userValue = input.value;
        const correctValue = puzzleMapData[rowIndex][cellIndex].toString();
        
        if (userValue === correctValue) {
          td.className = "correct";
          input.disabled = true;
        } else {
          td.className = "wrong"; 
          allDisabled = false;
        }
      }
    });
  });
  if (allDisabled) {
    showModal();
  }

}



function displayDescriptions(across, down) {
  const acrossDescriptionsBox = document.getElementById("across-descriptions");
  const downDescriptionsBox = document.getElementById("down-descriptions");
  
  acrossDescriptionsBox.innerHTML = '<h2 style="text-align: center;">가로 설명</h2>';
  downDescriptionsBox.innerHTML = '<h2 style="text-align: center;">세로 설명</h2>'; 

  across.forEach(item => {
    const descriptionItem = document.createElement("div");
    const [row, col] = item.startpoint;
    const cell = document.querySelector(`[data-row='${row}'][data-col='${col}']`);
    if (cell) {
      let numSpan = cell.querySelector(".num-display");

      if (!numSpan) {
        numSpan = document.createElement("span");
        numSpan.classList.add("num-display"); 
        cell.appendChild(numSpan);
      }
      
      if (numSpan.textContent) {
        numSpan.textContent += `, ${item.num}`;
      } else {
        numSpan.textContent = item.num;
      }
    }

    descriptionItem.textContent = `${item.num}: (${item.pos}) ${item.desc}`; 
    acrossDescriptionsBox.appendChild(descriptionItem);
  });

  down.forEach(item => {
    const descriptionItem = document.createElement("div");
    const [row, col] = item.startpoint;
    const cell = document.querySelector(`[data-row='${row}'][data-col='${col}']`);
    if (cell) {
      let numSpan = cell.querySelector(".num-display");

      if (!numSpan) {
        numSpan = document.createElement("span");
        numSpan.classList.add("num-display");
        cell.appendChild(numSpan);
      }
      
      if (numSpan.textContent) {
        numSpan.textContent += `, ${item.num}`;
      } else {
        numSpan.textContent = item.num;
      }
    }
    descriptionItem.textContent = `${item.num}: (${item.pos}) ${item.desc}`;
    downDescriptionsBox.appendChild(descriptionItem);
  });
}

async function checkLogin() {
  const response = await fetch(`${BASE_URL}/api/v1/auth/get-user`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: 'include'
  })
  if (response.ok){
    return true;
  } else {
    return false;
  }
}


async function initialize() {
  isLoggedIn = await checkLogin();
  console.log(isLoggedIn);
  loadPuzzleDetails().then(puzzleData => {
    puzzleMapData = puzzleData.map
    puzzleId = puzzleData.id
  })
}

initialize()