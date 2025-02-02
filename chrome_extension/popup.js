document.addEventListener('DOMContentLoaded', function () {
  let startButton = document.getElementById("start-btn");
  let pauseButton = document.getElementById("pause-btn");
  let resetButton = document.getElementById("reset-btn");
  let timerInput = document.getElementById("timer-input");

  let timeLeft;

  // Load stored timer value when popup opens
  chrome.storage.sync.get(["timeLeft"], function (result) {
    timeLeft = result.timeLeft ?? 25 * 60;
    updateDisplay(timeLeft);
  });

  function updateDisplay(time) {
    let minutes = Math.floor(time / 60);
    let seconds = time % 60;
    document.getElementById("timer-display").textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }

  // Function to continuously update timer display
  function startTimerUpdate() {
    setInterval(() => {
      chrome.storage.sync.get(["timeLeft"], function (result) {
        if (result.timeLeft !== undefined) {
          timeLeft = result.timeLeft; // Update local timeLeft
          updateDisplay(timeLeft);
        }
      });
    }, 1000); // Update every second
  }

  // Start updating the timer when popup opens
  startTimerUpdate();

  // Start timer message to background.js
  if (startButton) {
    startButton.addEventListener("click", function () {
      chrome.storage.sync.get(["timeLeft"], function (result) {
        timeLeft = result.timeLeft ?? 25 * 60; // Get last stored timeLeft
        console.log("Start button clicked. Sending startTimer message.");
        chrome.runtime.sendMessage({ action: "startTimer", timeLeft });
      });
    });
  }

  // Pause timer message to background.js
  if (pauseButton) {
    pauseButton.addEventListener("click", function () {
      console.log("Pause button clicked. Sending pauseTimer message.");
      chrome.runtime.sendMessage({ action: "pauseTimer" });
    });
  }

  // Reset timer message to background.js
  if (resetButton) {
    resetButton.addEventListener("click", function () {
      timeLeft = parseInt(timerInput.value) * 60 || 25 * 60;
      console.log("Reset button clicked. Sending resetTimer message.");
      chrome.runtime.sendMessage({ action: "resetTimer", timeLeft });
      updateDisplay(timeLeft);
    });
  }


  // Navigation for different sections
  function showSection(sectionId) {
    document.querySelectorAll('.popup-section').forEach(section => {
      section.style.display = 'none';
    });
    const section = document.getElementById(sectionId);
    if (section) {
      section.style.display = 'block';
    } else {
      console.error(`Section with ID ${sectionId} not found.`);
    }
  }

  const timerBtn = document.getElementById('timer-btn');
  if (timerBtn) {
    timerBtn.addEventListener('click', () => showSection('timer-popup'));
  } else {
    console.error('Element with ID "timer-btn" not found.');
  }

  const todoBtn = document.getElementById('todo-btn');
  if (todoBtn) {
    todoBtn.addEventListener('click', () => showSection('todo-popup'));
  } else {
    console.error('Element with ID "todo-btn" not found.');
  }

  const blockedSitesBtn = document.getElementById('blocked-sites-btn');
  if (blockedSitesBtn) {
    blockedSitesBtn.addEventListener('click', () => showSection('blocked-sites-popup'));
  } else {
    console.error('Element with ID "blocked-sites-btn" not found.');
  }

  const soundsBtn = document.getElementById('sounds-btn');
  if (soundsBtn) {
    soundsBtn.addEventListener('click', () => showSection('sounds-popup'));
  } else {
    console.error('Element with ID "sounds-btn" not found.');
  }

  // Back buttons
  const backButtons = document.querySelectorAll('.back-btn');
  if (backButtons.length > 0) {
    backButtons.forEach(button => {
      button.addEventListener('click', () => showSection('main-popup'));
    });
  } else {
    console.error('No elements with class "back-btn" found.');
  }

  // Blocked sites functionality
  let blockedSitesList = document.getElementById('blockedSitesList');
  let blockButton = document.getElementById('blockButton');
  let websiteInput = document.getElementById('website');

  function updateBlockedList(blockedSites) {
    blockedSitesList.innerHTML = '';
    if (blockedSites.length === 0) {
      blockedSitesList.innerHTML = '<p>No websites blocked!</p>';
    } else {
      blockedSites.forEach((site, index) => {
        const li = document.createElement("li");
        li.textContent = site;

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Remove';
        deleteButton.className = 'delete-button';

        deleteButton.addEventListener('click', function () {
          blockedSites.splice(index, 1);
          chrome.storage.sync.set({ blockedSites }, () => updateBlockedList(blockedSites));
        });

        li.appendChild(deleteButton);
        blockedSitesList.appendChild(li);
      });
    }
  }

  chrome.storage.sync.get(['blockedSites'], function (result) {
    const blockedSites = result.blockedSites || [];
    updateBlockedList(blockedSites);
  });

  if (blockButton) {
    blockButton.addEventListener("click", function () {
      const website = websiteInput.value.trim();
      if (website) {
        chrome.storage.sync.get(['blockedSites'], function (result) {
          const blockedSites = result.blockedSites || [];
          if (!blockedSites.includes(website)) {
            blockedSites.push(website);
            chrome.storage.sync.set({ blockedSites }, () => updateBlockedList(blockedSites));
          }
        });
      }
    });
  } else {
    console.error('Element with ID "blockButton" not found.');
  }

  // To-do list functionality
  let addTaskButton = document.getElementById("add-task-btn");
  let taskInput = document.getElementById("task-input");
  let taskList = document.getElementById("task-list");

  function updateTaskList(tasks) {
    taskList.innerHTML = "";
    if (tasks.length === 0) {
      taskList.innerHTML = '<p>No websites blocked!</p>';
    } else {
      tasks.forEach(function (task, index) {
        const li = document.createElement("li");
        li.textContent = task;

        const removeButton = document.createElement("button");
        removeButton.textContent = "Remove";
        removeButton.className = "delete-button";
        removeButton.addEventListener("click", function () {
          tasks.splice(index, 1);
          chrome.storage.sync.set({ tasks }, function () {
            updateTaskList(tasks);
          });
        });

        li.appendChild(removeButton);
        taskList.appendChild(li);
      });
    }
  }
  chrome.storage.sync.get(["tasks"], function (result) {
    updateTaskList(result.tasks || []);
  });

  if (addTaskButton) {
    addTaskButton.addEventListener("click", function () {
      const taskText = taskInput.value.trim();
      if (taskText) {
        chrome.storage.sync.get(["tasks"], function (result) {
          let tasks = result.tasks || [];
          tasks.push(taskText);
          chrome.storage.sync.set({ tasks: tasks }, function () {
            updateTaskList(tasks);
          });
        });
      }
    });
  } 
  // Store audio objects to allow play/pause control
const audioPlayers = {};

// Function to toggle sound play/pause
function toggleSound(soundId, soundUrl) {
    if (!audioPlayers[soundId]) {
        // Create new Audio object if not already playing
        audioPlayers[soundId] = new Audio(chrome.runtime.getURL(soundUrl));
        audioPlayers[soundId].loop = true;  // Enable looping
    }

    let audio = audioPlayers[soundId];

    if (audio.paused) {
        audio.play();
    } else {
        audio.pause();
    }
}

// Function to stop sound completely
function stopSound(soundId) {
    if (audioPlayers[soundId]) {
        audioPlayers[soundId].pause();
        audioPlayers[soundId].currentTime = 0; // Reset to start
    }
}

// Add event listeners for Play buttons
document.getElementById('rain-sound-btn')?.addEventListener('click', () => toggleSound('rain', 'sounds/rain.mp3'));
document.getElementById('fire-sound-btn')?.addEventListener('click', () => toggleSound('fire', 'sounds/fire.mp3'));
document.getElementById('cafe-sound-btn')?.addEventListener('click', () => toggleSound('cafe', 'sounds/cafe.mp3'));
document.getElementById('rainoncar-sound-btn')?.addEventListener('click', () => toggleSound('rainoncar', 'sounds/rainoncar.mp3'));
document.getElementById('white-noise-sound-btn')?.addEventListener('click', () => toggleSound('white-noise', 'sounds/white_noise.mp3'));
document.getElementById('birds-btn')?.addEventListener('click', () => toggleSound('birds', 'sounds/birds.mp3'));

// Add event listeners for Stop buttons (if added in HTML)
document.getElementById('rain-stop')?.addEventListener('click', () => stopSound('rain'));
document.getElementById('fire-stop')?.addEventListener('click', () => stopSound('fire'));
document.getElementById('cafe-stop')?.addEventListener('click', () => stopSound('cafe'));
document.getElementById('rainoncar-stop')?.addEventListener('click', () => stopSound('rainoncar'));
document.getElementById('white-noise-stop')?.addEventListener('click', () => stopSound('white-noise'));
document.getElementById('birds-stop')?.addEventListener('click', () => stopSound('birds'));

});