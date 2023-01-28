const script = document.createElement('script');
script.src = chrome.runtime.getURL("js/injected.js");
(document.head || document.documentElement).appendChild(script);