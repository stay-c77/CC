// Sound buttons - Play sound
document.getElementById('rain-sound-btn').addEventListener('click', () => {
  chrome.runtime.sendMessage({
    action: 'playSound',
    soundUrl: 'sounds/rain.mp3'
  });
});

document.getElementById('fire-sound-btn').addEventListener('click', () => {
  chrome.runtime.sendMessage({
    action: 'playSound',
    soundUrl: 'sounds/fire.mp3'
  });
});

document.getElementById('cafe-sound-btn').addEventListener('click', () => {
  chrome.runtime.sendMessage({
    action: 'playSound',
    soundUrl: 'sounds/cafe.mp3'
  });
});

document.getElementById('rainoncar-sound-btn').addEventListener('click', () => {
  chrome.runtime.sendMessage({
    action: 'playSound',
    soundUrl: 'sounds/rainoncar.mp3'
  });
});

// Stop sound button
document.getElementById('stop-sound-btn').addEventListener('click', () => {
  chrome.runtime.sendMessage({ action: 'stopSound' });
});

// Timer controls
let startButton = document.getElementById("start-btn");
let pauseButton = document.getElementById("pause-btn");
let resetButton = document.getElementById("reset-btn");
let timerDisplay = document.getElementById("timer-display");
let timerInput = document.getElementById("timer-input");
let timeLeft = 25 * 60;  // Default 25 minutes timer

startButton.addEventListener("click", function() {
  startTimer();
});

pauseButton.addEventListener("click", function() {
  clearInterval(timerInterval);
});

resetButton.addEventListener("click", function() {
  clearInterval(timerInterval);
  timeLeft = timerInput.value * 60 || 25 * 60;
  updateDisplay(timeLeft);
});

let timerInterval;

function startTimer() {
  timerInterval = setInterval(function() {
    if (timeLeft > 0) {
      timeLeft--;
      updateDisplay(timeLeft);
    } else {
      clearInterval(timerInterval);
      alert("Time's up!");
      // Play a sound when time is up
      chrome.runtime.sendMessage({
        action: 'playSound',
        soundUrl: 'sounds/alarm.mp3'
      });
    }
  }, 1000);
}

function updateDisplay(time) {
  let minutes = Math.floor(time / 60);
  let seconds = time % 60;
  timerDisplay.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

// Initial display update
updateDisplay(timeLeft);

// Task List functionality
let taskInput = document.getElementById('task-input');
let addTaskButton = document.getElementById('add-task-btn');
let taskList = document.getElementById('task-list');

// Add new task to the list
addTaskButton.addEventListener('click', function() {
  if (taskInput.value.trim() === "") return;

  let task = document.createElement('li');
  task.textContent = taskInput.value;
  let doneButton = document.createElement('button');
  doneButton.textContent = 'Done';
  doneButton.classList.add('done-btn');
  task.appendChild(doneButton);

  // Remove task on click of Done button
  doneButton.addEventListener('click', function() {
    task.remove();
  });

  taskList.appendChild(task);
  taskInput.value = "";
});
