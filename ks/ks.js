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
      Object.keys(this.players).forEach(id => {
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
            <span id="score-${id}" class="font-monospace badge bg-primary fs-5">${score}</span>
        </div>
        <div class="d-flex justify-content-between mt-2">
            <div class="font-monospace btn-group me-2" role="group">
                <button class="border-2 btn btn-outline-danger shadow btn-m" onclick="playerManager.changeScore('${id}', -10)">-10</button>
                <button class="border-2 btn btn-outline-danger shadow btn-m" onclick="playerManager.changeScore('${id}', -1)">&nbsp;-1</button>
                <button class="border-2 btn btn-outline-success shadow btn-m" onclick="playerManager.changeScore('${id}', 1)">&nbsp;+1</button>
                <button class="border-2 btn btn-outline-success shadow btn-m" onclick="playerManager.changeScore('${id}', 10)">+10</button>
            </div>
            <span class="delta-score d-flex align-items-center fs-6" style="padding-left: 5px; padding-right: 5px;"></span>
        </div>
        <div id="history-${id}" class="history mt-3">
          <ul class="history-list" id="history-list-${id}"></ul>
        </div>
        <div class="d-flex justify-content-end gap-2">
            <button class="btn btn-warning btn-m" onclick="playerManager.resetScore('${id}')" title="Reset Score">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 2v6h6M2.5 8a10 10 0 1 1 2.36 5.06"/></svg>
            </button>
            <button class="btn btn-danger btn-m" onclick="playerManager.removePlayer('${id}')">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
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
      li.textContent = `${(history[i].delta > 0 ? "+" : "") + history[i].delta
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
    const playerName = prompt("Enter player's name:");
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
