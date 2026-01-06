function updateTextWithEffect(span, newText) {
  // Update the text content
  span.textContent = newText;

  // Add the highlight class
  span.classList.add("highlight");

  // Remove the class after the animation ends
  span.addEventListener(
    "animationend",
    () => {
      span.classList.remove("highlight");
    },
    { once: true } // Ensures the event listener is removed after one execution
  );
}

export class PlayerManager {
  constructor() {
    this.players = {};
    this.playerTimeouts = {};
  }

  resetAllScores() {
    if (confirm("Are you sure you want to reset scores for ALL players?")) {
      Object.keys(this.players).forEach((id) => {
        this.players[id].score = 0;
        this.players[id].history = [];

        // Update UI if player card exists
        const scoreSpan = document.getElementById(`score-${id}`);
        if (scoreSpan) scoreSpan.textContent = "0";
        this.updateHistory(id);
      });
      this.saveScores();
    }
  }

  resetScore(playerId) {
    if (confirm(`Reset score for ${this.players[playerId].name}?`)) {
      this.players[playerId].score = 0;
      this.players[playerId].history = [];

      const scoreSpan = document.getElementById(`score-${playerId}`);
      if (scoreSpan) scoreSpan.textContent = "0";

      this.updateHistory(playerId);
      this.saveScores();
    }
  }

  saveScores() {
    localStorage.setItem("players", JSON.stringify(this.players));
  }

  uuidv4() {
    return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) =>
      (
        +c ^
        (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (+c / 4)))
      ).toString(16)
    );
  }

  rollDice(diceCount) {
    const diceDisplay = document.getElementById("dice-display");
    diceDisplay.innerHTML = "";

    const diceResults = [];
    for (let i = 0; i < diceCount; i++) {
      const diceDiv = document.createElement("div");
      diceDiv.className = "dice-roll";
      diceDiv.textContent = "🎲"; // Show dice animation
      diceDisplay.appendChild(diceDiv);

      setTimeout(() => {
        const result = Math.floor(Math.random() * 6) + 1;
        diceDiv.textContent = result;
        diceDiv.classList.remove("dice-roll");
        diceDiv.classList.add("dice", "border", "border-2");
        diceResults.push(result);
      }, 600); // Simulate rolling time
    }

    return diceResults;
  }

  loadScores() {
    this.players = JSON.parse(localStorage.getItem("players")) || {};
    if (this.players) {
      for (const key of Object.keys(this.players)) {
        this.createPlayer(this.players[key].name, key, this.players[key].score);
      }
    }
  }

  createPlayer(name, id, score = 0) {
    if (Object.keys(this.players).length >= 20) {
      alert("Maximum of 20 players allowed!");
      return;
    }

    const playerList = document.getElementById("player-list");
    const playerDiv = document.createElement("div");
    playerDiv.className = "bg-white border rounded p-3 mb-3 shadow-sm player";
    playerDiv.id = `player-${id}`;

    playerDiv.innerHTML = `
        <div class="d-flex align-items-center justify-content-between">
            <span class="font-monospace fw-bold fs-5">${name}</span>
            <span class="delta-score fw-bold text-muted fs-6" style="min-width: 35px; text-align: center;"></span>
            <span id="score-${id}" class="font-monospace badge bg-primary fs-5">${score}</span>
        </div>
        <div class="d-flex justify-content-between mt-2 align-items-center">
            <div class="font-monospace btn-group me-2" role="group">
                <button class="border-2 btn btn-outline-danger shadow btn-sm p-2" onclick="playerManager.changeScore('${id}', -10)">-10</button>
                <button class="border-2 btn btn-outline-danger shadow btn-sm p-2" onclick="playerManager.changeScore('${id}', -5)">-5</button>
                <button class="border-2 btn btn-outline-danger shadow btn-sm p-2" onclick="playerManager.changeScore('${id}', -1)">-1</button>
                <button class="border-2 btn btn-outline-success shadow btn-sm p-2" onclick="playerManager.changeScore('${id}', 1)">+1</button>
                <button class="border-2 btn btn-outline-success shadow btn-sm p-2" onclick="playerManager.changeScore('${id}', 5)">+5</button>
                <button class="border-2 btn btn-outline-success shadow btn-sm p-2" onclick="playerManager.changeScore('${id}', 10)">+10</button>
            </div>
        </div>
        <div id="history-${id}" class="history mt-3">
          <ul class="history-list" id="history-list-${id}"></ul>
        </div>
        <div class="d-flex justify-content-end gap-2 mt-2">
            <button class="btn btn-sm btn-outline-warning d-flex align-items-center justify-content-center" style="width: 38px; height: 38px;" onclick="playerManager.resetScore('${id}')" title="Reset Score">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-bootstrap-reboot" viewBox="0 0 16 16">
              <path d="M1.161 8a6.84 6.84 0 1 0 6.842-6.84.58.58 0 1 1 0-1.16 8 8 0 1 1-6.556 3.412l-.663-.577a.58.58 0 0 1 .227-.997l2.52-.69a.58.58 0 0 1 .728.633l-.332 2.592a.58.58 0 0 1-.956.364l-.643-.56A6.8 6.8 0 0 0 1.16 8z"/>
              <path d="M6.641 11.671V8.843h1.57l1.498 2.828h1.314L9.377 8.665c.897-.3 1.427-1.106 1.427-2.1 0-1.37-.943-2.246-2.456-2.246H5.5v7.352zm0-3.75V5.277h1.57c.881 0 1.416.499 1.416 1.32 0 .84-.504 1.324-1.386 1.324z"/>
            </svg>            
            </button>
            <button class="btn btn-sm btn-outline-danger" style="width: 38px; height: 38px;" onclick="playerManager.removePlayer('${id}')">
            <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#BB271A"><path d="M312-144q-29.7 0-50.85-21.15Q240-186.3 240-216v-480h-48v-72h192v-48h192v48h192v72h-48v479.57Q720-186 698.85-165T648-144H312Zm336-552H312v480h336v-480ZM384-288h72v-336h-72v336Zm120 0h72v-336h-72v336ZM312-696v480-480Z"/></svg>            
            </button>
        </div>
    `;
    playerList.appendChild(playerDiv);

    if (!this.players[id].history) {
      this.players[id].history = [];
    } else {
      this.updateHistory(id);
    }
  }

  changeScore(playerId, delta) {
    const now = Date.now();
    const scoreSpan = document.getElementById(`score-${playerId}`);
    const currentScore = parseInt(scoreSpan.textContent);
    const deltaScore = document
      .getElementById(`player-${playerId}`)
      .querySelector(".delta-score");
    // Add the score change with a timestamp to the history
    if (!this.players[playerId].history) {
      this.players[playerId].history = [{ delta, timestamp: now }];
    } else {
      let lastOne = this.players[playerId].history.at(-1);
      if (lastOne && now - lastOne.timestamp < 15000) {
        lastOne.delta += delta;
        lastOne.timestamp = now;
        // update the last history item
        this.players[playerId].history[
          this.players[playerId].history.length - 1
        ] = lastOne;
        updateTextWithEffect(
          deltaScore,
          (lastOne.delta > 0 ? "+" : "") + lastOne.delta
        );
        // deltaScore.textContent = (lastOne.delta > 0 ? "+" : "") + lastOne.delta;
      } else {
        this.players[playerId].history.push({ delta, timestamp: now });
        deltaScore.textContent = (delta > 0 ? "+" : "") + delta;
      }
    }

    // Update the displayed score
    scoreSpan.textContent = currentScore + delta;
    this.players[playerId].score = currentScore + delta;
    // sum the history array and make sure it is equal to score
    let sum = this.players[playerId].history.reduce((acc, curr) => {
      return acc + curr.delta;
    }, 0);
    if (sum !== this.players[playerId].score) {
      console.log("sum is not equal to score");
    }
    // Clear the delta score after 2 seconds
    if (this.playerTimeouts[playerId]) {
      clearTimeout(this.playerTimeouts[playerId]);
    }
    this.playerTimeouts[playerId] = setTimeout(() => {
      deltaScore.textContent = "";
    }, 15000);
    this.saveScores();
    this.updateHistory(playerId);
  }

  updateHistory(playerId) {
    const historyList = document.getElementById(`history-list-${playerId}`);
    historyList.innerHTML = "";

    // Traverse history and group by 5-second intervals
    const history = this.players[playerId].history;

    for (let i = history.length - 1; i >= 0; i--) {
      const li = document.createElement("li");
      li.textContent = `${
        (history[i].delta > 0 ? "+" : "") + history[i].delta
      }`;
      historyList.appendChild(li);
    }
  }

  removePlayer(playerId) {
    if (confirm("Are you sure you want to remove this player?")) {
      const playerDiv = document.getElementById(`player-${playerId}`);
      delete this.players[playerId];
      if (playerDiv) {
        playerDiv.remove();
      }
      this.saveScores();
    }
  }

  addPlayer() {
    const playerName = prompt("Enter player's name (max 25 characters): ");
    if (playerName == null) {
      return;
    }
    if (playerName.trim() !== "" && playerName.trim().length <= 25) {
      const pid = this.uuidv4();
      this.players[pid] = { name: playerName.trim(), score: 0, history: [] };
      this.createPlayer(this.players[pid].name, pid);
      this.saveScores();
    } else {
      alert("Invalid player name.");
    }
  }
}
