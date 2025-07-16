document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('add-player-btn').addEventListener('click', addPlayer);
});




document.getElementById('new-player-name').addEventListener('keypress', function(e) {
  if (e.key === 'Enter') {
    addPlayer();
  }
});






const categories = [
  'Einser', 'Zweier', 'Dreier', 'Vierer', 'Fünfer', 'Sechser',
  'Dreierpasch', 'Viererpasch', 'Full House',
  'Kleine Straße', 'Große Straße', 'Kniffel', 'Chance'
];









let players = [];
let currentPlayer = 0;
let dice = [0, 0, 0, 0, 0];
let keptDice = [false, false, false, false, false];
let rollsLeft = 3;

function toggleRules() {
  const rulesContent = document.getElementById('rules-content');
  rulesContent.style.display = rulesContent.style.display === 'none' ? 'block' : 'none';
}

function updatePlayersUI() {
  const playersEl = document.getElementById('players');
  if (document.getElementById('start-screen').style.display !== 'none') {
    // Startscreen: Nur Namen, kein Punkte
    playersEl.innerHTML = players.map((player, index) =>
      `<span class="player-name">${player.name}</span>`
    ).join('');
    document.getElementById('start-game-btn').style.display = players.length >= 1 ? 'block' : 'none';
  }
}

function updateCurrentPlayerUI() {
  const currentPlayerEl = document.getElementById('current-player');
  currentPlayerEl.innerHTML = players.map((player, index) =>
    `<div class="player-name ${currentPlayer === index ? 'current-player' : ''}">
      ${player.name} (${calculateTotalScore(player.scorecard)}P)
    </div>`
  ).join('');
}

function updatePlayersScoresUI() {
  const playersEl = document.getElementById('players');
  playersEl.innerHTML = players.map((player, index) =>
    `<span class="player-name ${currentPlayer === index ? 'current-player' : ''}">
      ${player.name} (${calculateTotalScore(player.scorecard)} P)
    </span>`
  ).join('');
}

function startGame() {
  if (players.length >= 1) {
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('game').style.display = 'block';
    updateCurrentPlayerUI();
    updateDiceUI();
    updateScorecardUI();
    updatePlayersScoresUI();
  } else {
    alert('Bitte mindestens einen Spieler hinzufügen, um das Spiel zu starten.');
  }
}

function updateDiceUI() {
  const diceEl = document.getElementById('dice');
  diceEl.innerHTML = dice.map((die, index) =>
    `<span class="die ${keptDice[index] ? 'kept' : ''}" onclick="toggleKeepDie(${index})">
      ${die === 0 ? '<i class="fa-solid fa-square"></i>' : `<i class="fa-solid fa-dice-${['one', 'two', 'three', 'four', 'five', 'six'][die - 1]} fa-xl"></i>`}
    </span>`
  ).join('');
}

function updateScorecardUI() {
  const upperCategories = categories.slice(0, 6);
  const lowerCategories = categories.slice(6);

  const upperHTML = upperCategories.map(category =>
  `<button class="btn scorecard-btn" onclick="selectCategory('${category}')" disabled>
    ${category}: ${players[currentPlayer].scorecard[category] !== undefined ? players[currentPlayer].scorecard[category] : '-'}
  </button>`
).join('');

const lowerHTML = lowerCategories.map(category =>
  `<button class="btn scorecard-btn" onclick="selectCategory('${category}')" disabled>
    ${category}: ${players[currentPlayer].scorecard[category] !== undefined ? players[currentPlayer].scorecard[category] : '-'}
  </button>`
).join('');


  document.getElementById('scorecard').innerHTML = `
    <div class="scorecard-columns">
      <div class="scorecard-column">${upperHTML}</div>
      <div class="scorecard-column">${lowerHTML}</div>
    </div>
  `;
}





function rollDice() {
  if (rollsLeft > 0) {
    dice = dice.map((die, index) => keptDice[index] ? die : Math.floor(Math.random() * 6) + 1);
    rollsLeft--;
    document.getElementById('rollBtn').innerHTML = `<i class="fa-solid fa-dice"></i> Würfel (${rollsLeft})`;
    updateDiceUI();
    document.querySelectorAll('#scorecard button').forEach(btn => btn.disabled = false);
    document.getElementById('end-turn-btn').style.display = 'block';
  }
}

function toggleKeepDie(index) {
  if (rollsLeft < 3 && dice[index] !== 0) {
    keptDice[index] = !keptDice[index];
    updateDiceUI();
  }
}

function selectCategory(category) {
  if (players[currentPlayer].scorecard[category] === undefined) {
    players[currentPlayer].scorecard[category] = calculateScore(category);
    updateScorecardUI();
    updatePlayersUI();
    document.getElementById('rollBtn').disabled = true;
    document.querySelectorAll('#scorecard button').forEach(btn => btn.disabled = true);
    document.getElementById('end-turn-btn').disabled = false;
  }
}

function calculateScore(category) {
  const counts = dice.reduce((acc, die) => {
    acc[die] = (acc[die] || 0) + 1;
    return acc;
  }, {});
  const sum = dice.reduce((a, b) => a + b, 0);

  switch (category) {
    case 'Einser':
    case 'Zweier':
    case 'Dreier':
    case 'Vierer':
    case 'Fünfer':
    case 'Sechser':
      // Index + 1 entspricht der Zahl
      const number = categories.indexOf(category) + 1;
      return dice.filter(d => d === number).reduce((a, b) => a + b, 0);

    case 'Dreierpasch':
      return Object.values(counts).some(count => count >= 3) ? sum : 0;

    case 'Viererpasch':
      return Object.values(counts).some(count => count >= 4) ? sum : 0;

    case 'Full House':
      const hasThree = Object.values(counts).some(count => count === 3);
      const hasTwo = Object.values(counts).some(count => count === 2);
      return hasThree && hasTwo ? 25 : 0;

    case 'Kleine Straße':
      const uniqueSorted = [...new Set(dice)].sort((a, b) => a - b);
      return uniqueSorted.some((_, i, arr) =>
        arr.slice(i, i + 4).every((v, j) => j === 0 || v === arr[i + j - 1] + 1)
      ) ? 30 : 0;

    case 'Große Straße':
      const sortedDice = [...dice].sort((a, b) => a - b);
      return sortedDice.every((die, index) => index === 0 || die === sortedDice[index - 1] + 1) ? 40 : 0;

    case 'Kniffel':
      return Object.values(counts).some(count => count === 5) ? 50 : 0;

    case 'Chance':
      return sum;
  }
}

function nextTurn() {
  rollsLeft = 3;
  keptDice = [false, false, false, false, false];
  dice = [0, 0, 0, 0, 0];
  document.getElementById('rollBtn').innerHTML = `<i class="fa-solid fa-dice"></i> Würfel (${rollsLeft})`;
  document.getElementById('rollBtn').disabled = false;
  document.getElementById('end-turn-btn').style.display = 'none';
  document.getElementById('end-turn-btn').disabled = true;
  currentPlayer = (currentPlayer + 1) % players.length;
  if (isGameOver()) {
    endGame();
  } else {
    updateCurrentPlayerUI();
    updateDiceUI();
    updateScorecardUI();
    updatePlayersUI();
  }
}

function isGameOver() {
  return players.every(player =>
    Object.keys(player.scorecard).length === categories.length
  );
}

function endGame() {
  const gameEl = document.getElementById('game');
  const endScreenEl = document.getElementById('end-screen');
  const finalScoresEl = document.getElementById('final-scores');
  gameEl.style.display = 'none';
  endScreenEl.style.display = 'block';
  const sortedPlayers = [...players].sort((a, b) =>
    calculateTotalScore(b.scorecard) - calculateTotalScore(a.scorecard)
  );
  finalScoresEl.innerHTML = sortedPlayers.map((player, index) =>
    `<div class="${index === 0 ? 'winner' : ''}">
      ${player.name}: ${calculateTotalScore(player.scorecard)} Punkte ${index === 0 ? ' ♕' : ''}
    </div>`
  ).join('');
}

function calculateTotalScore(scorecard) {
  return Object.values(scorecard).reduce((a, b) => a + b, 0);
}

function resetGame() {
  players = [];
  currentPlayer = 0;
  dice = [0, 0, 0, 0, 0];
  keptDice = [false, false, false, false, false];
  rollsLeft = 3;
  document.getElementById('start-screen').style.display = 'block';
  document.getElementById('game').style.display = 'none';
  document.getElementById('end-screen').style.display = 'none';
  document.getElementById('players').innerHTML = '';
  document.getElementById('start-game-btn').style.display = 'none';
}

function addPlayer() {
  const newPlayerName = document.getElementById('new-player-name').value.trim();
  if (newPlayerName) {
    players.push({
      name: newPlayerName,
      scorecard: {}
    });
    console.log('Spieler hinzugefügt:', newPlayerName);
    document.getElementById('new-player-name').value = '';
    updatePlayersUI();
  } else {
    console.log('Spielername ist leer');
  }
}

document.addEventListener('keydown', function(event) {
  if (event.key === 'e' || event.key === 'E') {
    endGame();
  }
});

document.getElementById('start-screen').style.display = 'block';






    particlesJS("particles-js", {
  "particles": {
    "number": {
      "value": 80,
      "density": {
        "enable": true,
        "value_area": 800
      }
    },
    "color": { "value": "#ffffff" },
    "shape": {
      "type": "circle",
      "stroke": { "width": 0, "color": "#000000" },
      "polygon": { "nb_sides": 5 }
    },
    "opacity": {
      "value": 0.5,
      "random": false,
      "anim": { "enable": false }
    },
    "size": {
      "value": 3,
      "random": true,
      "anim": { "enable": false }
    },
    "line_linked": {
      "enable": true,
      "distance": 150,
      "color": "#ffffff",
      "opacity": 0.4,
      "width": 1
    },
    "move": {
      "enable": true,
      "speed": 6,
      "direction": "none",
      "random": false,
      "straight": false,
      "out_mode": "out",
      "bounce": false,
      "attract": { "enable": false }
    }
  },
  "interactivity": {
    "detect_on": "canvas",
    "events": {
      "onhover": {
        "enable": true,
        "mode": "repulse"
      },
      "onclick": {
        "enable": true,
        "mode": "repulse"      // <- geändert von 'push' zu 'repulse'
      },
      "resize": true
    },
    "modes": {
      "grab": {
        "distance": 400,
        "line_linked": { "opacity": 1 }
      },
      "bubble": {
        "distance": 400,
        "size": 40,
        "duration": 2,
        "opacity": 8,
        "speed": 3
      },
      "repulse": {
        "distance": 200,
        "duration": 0.4
      },
      "push": {
        "particles_nb": 4
      },
      "remove": {
        "particles_nb": 2
      }
    }
  },
  "retina_detect": true
});

var count_particles, stats, update;
stats = new Stats;
stats.setMode(0);
stats.domElement.style.position = 'absolute';
stats.domElement.style.left = '0px';
stats.domElement.style.top = '0px';
document.body.appendChild(stats.domElement);
count_particles = document.querySelector('.js-count-particles');
update = function() {
  stats.begin();
  stats.end();
  if (window.pJSDom[0].pJS.particles && window.pJSDom[0].pJS.particles.array) {
    count_particles.innerText = window.pJSDom[0].pJS.particles.array.length;
  }
  requestAnimationFrame(update);
};
requestAnimationFrame(update);