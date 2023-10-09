
// Allows users to open the side panel by clicking the toolbar icon
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

// Setup the context menu
function setupContextMenu() {
  chrome.contextMenus.create({
    id: 'look-up',
    title: 'OpenAI Vocabulary Builder',
    contexts: ['selection']
  });
}

chrome.runtime.onInstalled.addListener(() => {
  setupContextMenu();
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'look-up') {
    // This will open the panel in all the pages on the current window.
    chrome.sidePanel.open({ windowId: tab.windowId });
    
    setTimeout(() => {
      chrome.runtime.sendMessage({
        name: 'look-up',
        data: { value: info.selectionText }
      })
    }, 200);

    // await new Promise(resolve => {
    //     chrome.runtime.onMessage.addListener(function listener(message) {
    //         if (message.type === "sidepanel_ready") {
    //             console.log("sidepanel_ready received");
    //             chrome.runtime.onMessage.removeListener(listener);
    //             resolve(); // Now you can safely send your message to the side panel
    //         }
    //     });
    // });
  }
});
