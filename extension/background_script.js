browser.webRequest.onBeforeRequest.addListener(
  (details) => {
    browser.scripting.executeScript({
      target: {
        tabId: details.tabId
      },
      func: () => {
        alert("here")
      }
    })
    return { cancel: true };
  },
  {
    urls: ["<all_urls>"],
  },
  ["blocking"]
);

