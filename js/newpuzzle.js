import { BASE_URL } from "./config.js";

let puzzleMapData = null;
let isLoggedIn = false;
let puzzleId = null;

function showModal() {
  const modal = document.getElementById("result-modal");
  const modalMessage = modal.querySelector("p");
  const modalTitle = modal.querySelector("h2");
  const puzzleNameContainer = modal.querySelector("#puzzle-name-container");

  puzzleNameContainer.innerHTML = "";

  if (isLoggedIn) {
    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "퍼즐의 이름을 입력하세요";
    input.id = "puzzle-name-input";

    const saveButton = document.createElement("button");
    saveButton.textContent = "저장";
    saveButton.onclick = savePuzzleName;

    puzzleNameContainer.appendChild(input);
    puzzleNameContainer.appendChild(saveButton);

    modalTitle.textContent = "정답입니다!";
    modalMessage.textContent = "정답 확인이 완료되었습니다. 퍼즐의 이름을 설정하세요!";
  } else {
    modalTitle.textContent = "로그인이 필요합니다!";
    modalMessage.textContent = "로그인 후 퍼즐 이름을 설정할 수 있습니다.";
    
    const goToMainButton = document.createElement("button");
    goToMainButton.textContent = "메인 페이지로 돌아가기";
    goToMainButton.onclick = () => {
      window.location.href = "main.html";
    };

    puzzleNameContainer.appendChild(goToMainButton);
  }

  modal.style.display = "block";
}

async function savePuzzleName() {
  const puzzleNameInput = document.getElementById("puzzle-name-input");
  const puzzleName = puzzleNameInput.value;

  if (puzzleName) {
    try {
      console.log("퍼즐 이름이 저장되었습니다:", puzzleName);
      const response = await fetch(`${BASE_URL}/api/v1/puzzle/name/update?name=${encodeURIComponent(puzzleName)}&puzzle_id=${puzzleId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data);
        window.location.href = `main.html`;
        alert("퍼즐 이름이 성공적으로 저장되었습니다!"); 
      } else {
        const errorData = await response.json();
        console.error("서버 오류:", errorData);
        alert("퍼즐 이름 저장에 실패했습니다. 다시 시도해 주세요.");
      }

    } catch (error) {
      console.error("오류 발생:", error);
      alert("퍼즐 이름 저장 중 오류가 발생했습니다. 네트워크를 확인하세요.");
    }
  } else {
    alert("퍼즐 이름을 입력해주세요.");
  }
}


function closeModal() {
  const modal = document.getElementById("result-modal");
  modal.style.display = "none";
}

document.getElementById("close-modal").addEventListener("click", closeModal);


async function loadPuzzleDetails() {
        const urlParams = new URLSearchParams(window.location.search);
        const size = urlParams.get("size");

        try {
            const response = await fetch(`${BASE_URL}/api/v1/puzzle?size=${size}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: 'include',
            });

        if (!response.ok) {
            throw new Error("퍼즐 생성 실패");
        }

        const puzzleData = await response.json();
        displayPuzzleMap(puzzleData.map)
        displayDescriptions(puzzleData.across, puzzleData.down)
        document.getElementById("loading").style.display = "none";
        document.querySelector('.answer-check-wrapper').style.display = 'flex'; 
        document.getElementById('description-box').style.visibility = 'visible';
        return puzzleData
    } catch (error) {
        console.error(error.message);
        document.getElementById("puzzle-details").textContent = "데이터를 불러오는 중 오류가 발생했습니다.";
    }
};

function displayPuzzleMap(map) {
    const puzzleBody = document.getElementById("puzzle-body");
    puzzleBody.innerHTML = ''; 
  
    for (let rowIndex = 0; rowIndex < map.length - 1; rowIndex++) {
      const tr = document.createElement("tr");
  
      for (let cellIndex = 0; cellIndex < map[rowIndex].length - 1; cellIndex++) {
        const td = document.createElement("td");
        
        td.setAttribute("data-row", rowIndex);
        td.setAttribute("data-col", cellIndex);
        // td.textContent = map[rowIndex][cellIndex];
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