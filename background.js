let currentTab = null;

// Track time spent on old tab and update current tab
function trackTab(tabId, title, url ) {
    const now = Date.now();

    if (currentTab && currentTab.startTime) {
        const duration = now - currentTab.startTime;

        const record = {
            url: currentTab.url,
            title: currentTab.title,
            startTime: currentTab.startTime,
            endTime: now,
            duration
          };

        chrome.storage.local.get(['history'], (data) => {
            const history = data.history || [];
            history.push(record);
            chrome.storage.local.set({history});
            console.log('Tracked:', record);
        })

    }

    currentTab = {
        tabId,
        url,
        title,
        startTime: now
    }
}

// When user swtiches tabs
chrome.tabs.onActivated.addListener(async (activeInfo) => {
    const tab = await chrome.tabs.get(activeInfo.tabId);

    if (tab && tab.url.startsWith("http")) {
        trackTab(tab.id, tab.url, tab.title);
      }
});

// When tab finishes loading (handles refreshes and new navigations)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete" && tab.active && tab.url.startsWith("http")) {
      trackTab(tab.id, tab.url, tab.title);
    }
  });