let audio = null;

// Function to play sound
function playSound(soundUrl) {
  if (audio && !audio.paused) {
    audio.pause();
    audio.currentTime = 0;
  }

  audio = new Audio(soundUrl);
  audio.loop = true; // This will make the sound loop indefinitely
  audio.play();
}

// Function to stop the sound
function stopSound() {
  if (audio) {
    audio.pause();
    audio.currentTime = 0;
  }
}

// Listening for messages from the popup
chrome.runtime.onMessage.addListener((message) => {
  if (message.action === 'playSound') {
    playSound(message.soundUrl);
  } else if (message.action === 'stopSound') {
    stopSound();
  }
});
