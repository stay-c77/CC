chrome.runtime.onInstalled.addListener(function () {
  chrome.storage.sync.set({ blockedSites: [] }, function () {
    console.log('Blocked sites initialized.');
  });
  chrome.storage.sync.set({tempAllowed: []}, function() {
    console.log('Temporary sites initialized')
  });
});

chrome.webNavigation.onBeforeNavigate.addListener(function (details) {
  chrome.storage.sync.get(['blockedSites'], function (result) {
    const blockedSites = result.blockedSites || [];
    const url = new URL(details.url);
    chrome.tabs.get(details.tabId, function (tab) {
      if(!(tab.url.includes('redirect.html'))){
        const tabUrl = new URL(tab.url);
        if (blockedSites.includes(tabUrl.hostname)){
          chrome.storage.sync.get(['tempAllowed'], function(list){
              const tempAllowed = list.tempAllowed;
              if(!(tempAllowed.includes(tabUrl.hostname))){
                chrome.tabs.update(details.tabId, { url: chrome.runtime.getURL('redirect.html') });
                chrome.storage.sync.set({wantedSite: tab.url}, function () {
                  console.log('Original url is stored')
                });
              }
          });
        }
      }
    });
  });
});

function loop(i, reason, signature, reminders, repeats) {         
  setTimeout(function() {  
    console.log(i, reason, signature, reminders, repeats);
    if(i == reminders){
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
          chrome.tabs.remove(tabs[0].id);
        });
        chrome.storage.sync.set({tempAllowed: []}, function(){
            console.log(`Temporary websites cleared.`);
        }); 
        i++;
    }                  
  }, 1000*(repeats*60))
  
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.command === "loop") {
    
    loop(request.params.i, request.params.reason, request.params.signature, request.params.reminders, request.params.repeats);
  }
});

let timerInterval;
let timeLeft = 25 * 60; // Default timer value

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "startTimer") {
    clearInterval(timerInterval);
    timeLeft = request.timeLeft || timeLeft;
    console.log("Starting timer with timeLeft:", timeLeft);
    timerInterval = setInterval(() => {
      if (timeLeft > 0) {
        timeLeft--;
        chrome.storage.sync.set({ timeLeft });
      } else {
        clearInterval(timerInterval);
        chrome.storage.sync.remove("timeLeft");
        chrome.notifications.create({
          type: "basic",
          iconUrl: "icons/icon48.jpg",
          title: "Time's Up!",
          message: "Your timer has finished.",
        });
        chrome.runtime.sendMessage({ action: "playSound", soundUrl: "sounds/timer_up.mp3" });
      }
    }, 1000);
  } else if (request.action === "pauseTimer") {
    console.log("Pausing timer");
    clearInterval(timerInterval);
  } else if (request.action === "resetTimer") {
    clearInterval(timerInterval);
    timeLeft = request.timeLeft || 25 * 60;
    console.log("Resetting timer with timeLeft:", timeLeft);
    chrome.storage.sync.set({ timeLeft });
  } 
});
let audioElements = {};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "playSound") {
        if (!audioElements[request.soundId]) {
            audioElements[request.soundId] = new Audio(chrome.runtime.getURL(request.soundUrl));
            audioElements[request.soundId].loop = true; // Loop music
        }
        audioElements[request.soundId].play();
    } else if (request.action === "stopSound") {
        if (audioElements[request.soundId]) {
            audioElements[request.soundId].pause();
            audioElements[request.soundId].currentTime = 0; // Reset to start
        }
    }
});
