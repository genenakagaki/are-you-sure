var DEBUG = true;

function logger(prefix) {
  if (DEBUG) {
    return (message, object) => {
      console.debug(`are-you-sure:${prefix}${message}`, object);
    }
  }
}

const whitelistKey = 'whitelist';

function confirmNavigation(urlHref) {
  const log = logger(confirmNavigation.name);
  log('', urlHref)

  const url = new URL(urlHref);

  if (confirm(`以下のサイトをホワイトリストに追加しますか？\n${url.href}`)) {
    // TODO: whitelistに追加する
    console.log("sholud add to wihelist")
  }
}

async function isInWhitelist(url) {
  const log = logger(isInWhitelist.name)
  log('', url)
  
  return browser.storage.local.get(whitelistKey).then(
    ({whitelist}) => {
      log('.storage.get', whitelist)

      if (!whitelist) {
        log('.storage.get:whitelist is undefined', whitelist)

        browser.storage.local.set({
          [whitelistKey]: [],
        })

        return false;
      }

      return whitelist.includes(url.host);
    },
    () => {
      console.error("Error retrieving whitelist");
      console.debug("isInWhiteList.storage.get.error", url);
    });
}

browser.webRequest.onBeforeRequest.addListener(
  async (details) => {
    console.log("details", details)

    const originUrl = new URL(details.originUrl)
    // TODO: origin のドメインがGmailかチェックする
    // manifestでできるかも
    // ユーザーが指定できるようにするのがいいかも
    
    const url = new URL(details.url);

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

