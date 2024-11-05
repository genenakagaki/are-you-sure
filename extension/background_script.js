var DEBUG = true;

function logger(prefix) {
  if (DEBUG) {
    return (message, object) => {
      console.debug(`are-you-sure:${prefix}:${message}`, object);
    }
  }
}

// -------------
// Storage 
// -------------

const whitelistKey = 'whitelist';


async function resetWhitelist() {
  browser.storage.local.set({
    [whitelistKey]: [],
  })
}

async function getWhitelist() {
  const log = logger(getWhitelist.name);
  
  const {whitelist} = await browser.storage.local.get(whitelistKey);
  log('whitelist', whitelist)

  if (!whitelist) {
    log('whitelist is undefined', undefined)

    browser.storage.local.set({
      [whitelistKey]: [],
    })

    return [];
  }

  return whitelist;
}

async function isInWhitelist(url) {
  const log = logger(isInWhitelist.name)
  log('', url)
  
  try {
    const whitelist = await getWhitelist();
    return whitelist.includes(url.host);
  } catch (error) {
    console.error(error);
  }
}

async function addToWhitelist(url) {
  const whitelist = await getWhitelist();

  if (!whitelist.includes(url.host)) {
    whitelist.push(url.host);
    browser.storage.local.set({
      [whitelistKey]: whitelist,
    })
  }
}

// -------------
// Scripting 
// -------------

async function confirmToAddToWhitelist(url, tabId) {
  const log = logger(confirmToAddToWhitelist.name);
  log('', url)

  try {
    const injectionResults = await browser.scripting.executeScript({
      target: {
        tabId: tabId,
      },
      args: [url.href],
      func: (urlHref) => {
        console.log(urlHref)
        const url = new URL(urlHref);
        return confirm(`以下のサイトをホワイトリストに追加しますか？\n${url.href}`)
      } 
    })

    log(injectionResults.name, injectionResults);

    const shouldAddToWhitelist = injectionResults[0].result;
    if (shouldAddToWhitelist) {
      addToWhitelist(url)
    }

    return shouldAddToWhitelist;
  } catch (error) {
    console.error(error);
  }
}


function isGmailDomain(url) {
  return url.host === "mail.google.com";
} 

async function onBeforeRequestListener(details) {
  const log = logger(onBeforeRequestListener.name);
  log('', details);

  if (details.tabId === -1) {
    log('request was not in content (maybe in devtools)')
    return { cancel: false };
  }

  const originUrl = new URL(details.originUrl)
  if (!isGmailDomain(originUrl)) {
    log('origin domain was not gmail');
    return { cancel: false };
  }
  
  const url = new URL(details.url);
  if (isGmailDomain(url) || await isInWhitelist(url)) {
    log('target domain was in whitelist');
    return { cancel: false };
  }

  console.log(details)
  const shouldNavigate = await confirmToAddToWhitelist(url, details.tabId);

  return { cancel: !shouldNavigate };
}

browser.webRequest.onBeforeRequest.addListener(
  onBeforeRequestListener,
  {
    urls: ["<all_urls>"],
    types: ["main_frame"],
  },
  ["blocking"]
);


//  getWhitelist()

// resetWhitelist()

// isInWhitelist(new URL("https://mail.google.com/mail/u/0/#inbox"))
//   .then(res => console.log(res))

// addToWhitelist(new URL("https://mail.google.com/mail/u/0/#inbox"));

// confirmToAddToWhitelist(new URL("https://mail.google.com/mail/u/0/#inbox"), 1);
