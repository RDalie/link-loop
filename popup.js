document.getElementById('view-graph').addEventListener('click', () => {
  // chrome.runtime.getURL() gives you the correct extension-packaged URL
  const url = chrome.runtime.getURL('graph.html');
  chrome.tabs.create({ url });
});