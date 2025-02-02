document.addEventListener('DOMContentLoaded', function()
{
    const closeButton = document.getElementById('closeTab');
    
    if(closeButton){
        closeButton.addEventListener('click', closeTab);
    }
    
    function closeTab(){
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.remove(tabs[0].id);
        });
    }   
    
})