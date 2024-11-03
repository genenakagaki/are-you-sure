var DEBUG = true;

function logger(prefix) {
  if (DEBUG) {
    return (message, object) => {
      console.debug(`are-you-sure:${prefix}${message}`, object);
    }
  }
}

const whiteListKey = 'whiteList';

function confirmNavigation(urlHref) {
  const log = logger(confirmNavigation.name);
  log('', urlHref)

  const url = new URL(urlHref);

  if (confirm(`以下のサイトをホワイトリストに追加しますか？\n${url.href}`)) {
    // TODO: whitelistに追加する
    console.log("sholud add to wihelist")
  }
}

function isInWhiteList(url) {
  const log = logger(isInWhiteList)
  log('', url)

  browser.storage.local.set({
    'whiteList': [],
    'testing': []
  })
  
  return browser.storage.local.get(whiteListKey).then(
    ({whiteList}) => {
      log('.storage.url', url)
      log('.storage.get', whiteList)

      // if (whiteList.includes(url.host)) {
      //   console.log("here")
      // } 
    },
    () => {
      console.debug("isInWhiteList.storage.get.error", url);
    });
}

browser.webRequest.onBeforeRequest.addListener(
  async (details) => {
    console.log("details", details)

    // const originUrl = new URL(details.originURL)
    // TODO: origin のドメインがGmailかチェックする
    // manifestでできるかも
    // ユーザーが指定できるようにするのがいいかも
    
    const url = new URL(details.url);
    console.log(url)

    isInWhiteList(url)
    
    // if (domainWhiteList.includes(url.host)) {
    //   return { cancel: false }; 
    // } 

    browser.scripting.executeScript({
      target: {
        tabId: details.tabId
      },
      args: [url.href],
      func: confirmNavigation 
    })

    return { cancel: true };
  },
  {
    urls: ["<all_urls>"],
  },
  ["blocking"]
);

