const aScript = {
  id: "are-you-sure-script",
  js: ["script.js"],
  matches: ["https://example.com/*"],
};

try {
  await browser.scripting.registerContentScripts([aScript]);
} catch (err) {
  console.error(`failed to register content scripts: ${err}`);
}

await browser.scripting.registerContentScripts(
  scripts         // array
)
