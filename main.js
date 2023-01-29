(async () =>
{
	const EMOTES_URL = "https://s1ye.github.io/GGExtraEmotes/emotes/";
	const extraemotes_urls = await GetEmotesUrls();
	InfinityAddNickClickEvent();
	InfinityAddCustomInput();
	InfinityAddEmojis();

	async function InfinityAddNickClickEvent()
	{
		await AddNickClickEvent();
		setTimeout(InfinityAddNickClickEvent, 500);
	}

	async function InfinityAddCustomInput()
	{
		if (!document.getElementById("ggextraemotes_msg_input"))
		{
			await AddCustomInput();
		}
		setTimeout(InfinityAddCustomInput, 500);
	}

	async function InfinityAddEmojis()
	{
		await AddEmojis();
		setTimeout(InfinityAddEmojis, 500);
	}

	async function AddNickClickEvent()
	{
		await GetElementByXPath('//div[@class="tse-content"]//chat-user');
		var chat_section = await GetElementByXPath('//div[@class="tse-content"]');
		var chat_users = chat_section.getElementsByTagName("chat-user");
		for (var i = 0; i < chat_users.length; i++)
		{
			if (chat_users[i].getAttribute("ggextraemotes_has_event")) { continue; }
			chat_users[i].setAttribute("ggextraemotes_has_event", true);
			var nickname = Replace(chat_users[i].innerText, " ", "");
			chat_users[i].onclick = function()
			{
				var custom_input = document.getElementById("ggextraemotes_msg_input");
				custom_input.innerHTML += "&nbsp;" + this + ',&nbsp;';
			}.bind(nickname);
		}
	}

	async function AddCustomInput()
	{
		const text_block = await GetElementByXPath('//div[@class="chat-control-block"]//div[@class="text-block ng-scope"]');
		const source_textarea = await GetElementByXPath('//div[@class="chat-control-block"]//div[@class="textarea"]');
		source_textarea.style = "display: none";
		const ggextraemotes_msg_input = CreateGGExtraEmotesMsgInput();
		text_block.prepend(ggextraemotes_msg_input);
		const observer = new MutationObserver(function(mutations)
		{
			for (var i = 0; i < mutations.length; i++)
			{
				var smile_div = document.createElement("divforemote");
				smile_div.setAttribute("contenteditable", false);
				var element = mutations[i].addedNodes[0];
				if (!element) { continue; }
				if (!IsHTMLElement(element)) { continue; }
				smile_div.append(element);
				ggextraemotes_msg_input.append(smile_div);
			}
		});
		observer.observe(source_textarea, { childList: true, subtree: true });

		ggextraemotes_msg_input.onpaste = function(clipboard_event)
		{
			return InsertTextOnly(clipboard_event);

			function InsertTextOnly(clipboard_event)
			{
				clipboard_event.preventDefault();
				const text = (clipboard_event.clipboardData || window.clipboardData).getData("text");
				const selection = window.getSelection();
				if (!selection.rangeCount) return;
				selection.deleteFromDocument();
				selection.getRangeAt(0).insertNode(document.createTextNode(text));
				selection.collapseToEnd();
				return false;
			}
		}
		ggextraemotes_msg_input.onkeyup = function(keyboard_event)
		{
			if (keyboard_event.keyCode != 13) { return; }
			keyboard_event.preventDefault();
			const text = ReplaceHTMLWithText(ggextraemotes_msg_input.innerHTML);
			if (text.indexOf("<") > -1 && text.indexOf(">") > -1)
			{
				alert("В отправленном сообщении обнаружены символы '<' и '>', это может означать, что сообщение содержит html-код. Пожалуйста, уберите их из сообщения. Если вы их не писали, то это означает, что расширение сломалось. Отключите расширение GGExtraEmotes и перезагрузите страницу.");
				return false;
			}
			SendMessage(text);
			return false;

			function ReplaceHTMLWithText(html)
			{
				var text = CopyStrByValue(html);
				text = Replace(text, "))", " " + EMOTES_URL + "Brackets.png ");
				text = Replace(text, "<div>", "");
				text = Replace(text, "</div>", "");
				text = Replace(text, "<br>", "");
				text = Replace(text, "&nbsp;", " ");
				text = Replace(text, "&lt;", "<");
				text = Replace(text, "&gt;", ">");
				text = Replace(text, "\n", "");
				text = Replace(text, "\r", "");
				text = Replace(text, "\t", "");
				for (var i = 0; i < extraemotes_urls.length; i++)
				{
					const replace = '<img class="ggextraemote_in_input" src="' + extraemotes_urls[i] + '">';
					text = Replace(text, replace, ' ' + extraemotes_urls[i] + ' ');
				}
				const emotes = text.split("<divforemote");
				for (var i = 1; i < emotes.length; i++)
				{
					const inner_emote = emotes[i].split("</divforemote>")[0];
					try
					{
						const name = inner_emote.split('tooltip="')[1].split('"')[0];
						text = Replace(text, "<divforemote" + inner_emote + "</divforemote>", " " + name + " ");
					}
					catch(e)
					{
						text = Replace(text, "<divforemote" + inner_emote + "</divforemote>", "");
					}
				}
				return text;
			}

			function SendMessage(text)
			{
				console.log("Отправка сообщения: '" + text + "'");
				source_textarea.innerText = text;
				source_textarea.dispatchEvent(new KeyboardEvent("keypress",
				{
					keyCode: 13,
					bubbles: false,
					cancelable: false
				}));
				ggextraemotes_msg_input.innerHTML = "";
				setTimeout(function() { ggextraemotes_msg_input.innerHTML = "" }, 100);
			}
		}

		function CreateGGExtraEmotesMsgInput()
		{
			const ggextraemotes_msg_input = document.createElement("div");
			ggextraemotes_msg_input.id = "ggextraemotes_msg_input";
			ggextraemotes_msg_input.className = "textarea";
			ggextraemotes_msg_input.setAttribute("contenteditable", true);
			ggextraemotes_msg_input.setAttribute("placeholder", "Написать сообщение...");
			return ggextraemotes_msg_input;
		}
	}

	async function AddEmojis()
	{
		var smile_list = await GetElementByXPath('//*[@id="smiles"]//div[@class="smile-list"]');
		if (smile_list.getElementsByClassName("ggextraemote")[0]) { return; }
		for (var i = 0; i < extraemotes_urls.length; i++)
		{
			var emoji = document.createElement("img");
			emoji.src = extraemotes_urls[i];
			emoji.className = "ggextraemote";
			emoji.onclick = function()
			{
				var custom_input = document.getElementById("ggextraemotes_msg_input");
				custom_input.innerHTML += '<img class="ggextraemote_in_input" src="' + this + '">';
			}.bind(extraemotes_urls[i]);
			smile_list.prepend(emoji);
		}
	}

	async function GetElementByXPath(xpath)
	{
		return await new Promise(function(resolve, reject)
		{
			var interval = setInterval(function()
			{
				var element = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
				if (!element) { return; }
				clearInterval(interval);
				resolve(element);
			}, 50);
		});
	}

	async function GetEmotesUrls()
	{
		return await new Promise(async function(resolve, reject)
		{
			async function InnerGetEmotesUrls()
			{
				try
				{
					const emotes_urls = await Get(
					{
						url: "https://s1ye.github.io/GGExtraEmotes/list.txt",
						from_cache: false,
			 			max_attempts: 5,
			 			retry_ms: 1000,
						timeout_ms: 5000
					});
					var tmp = emotes_urls.split("\n");
					for (var i = 0; i < tmp.length; i++)
					{
						tmp[i] = EMOTES_URL + tmp[i];
						tmp[i] = Replace(tmp[i], "\n", "");
						tmp[i] = Replace(tmp[i], "\r", "");
						tmp[i] = Replace(tmp[i], "\t", "");
					}
					resolve(tmp);
				}
				catch(e)
				{
					console.log(e);
				}
			}
			await InnerGetEmotesUrls();
		});
	}

	async function Get({url, from_cache, max_attempts, retry_ms, timeout_ms} = {})
	{
		return await new Promise(async function(resolve, reject)
		{
			var attempts_used = 0; 
			GetWithRepeat();

			async function GetWithRepeat()
			{
				try
				{
					attempts_used++;
					return resolve(await InnerGet(
					{
						url: url,
						from_cache: from_cache,
						timeout_ms: timeout_ms
					}));
				}
				catch(err)
				{
					console.log(err);
					if (attempts_used >= max_attempts)
					{
						return reject(new Error("[GGExtraEmotes] Maximum number of attempts reached in Get('" + url + ", " + from_cache + ", " + max_attempts + ", " + retry_ms + ", " + timeout_ms + ")"));
					}
					setTimeout(GetWithRepeat, retry_ms);
				}
			}

			async function InnerGet({url, from_cache, timeout_ms} = {})
			{
				var cache_setting = "default";
				if (!from_cache) { cache_setting = "no-cache"; }
				const controller = new AbortController();
				const fetch_timeout = setTimeout(() => controller.abort(), timeout_ms);
				return await fetch(url, { cache: cache_setting, signal: controller.signal}).then(async function(response)
				{
					if (response.status >= 400 && response.status < 600)
					{
						throw new Error("[GGExtraEmotes] InnerGet('" + url + "', " + from_cache + ", " + timeout_ms + ") return status: " + response.status);
					}
					return await response.text();
				}).catch(function(err) { throw new Error(err); });
			};
		});
	}

	function Replace(str, a, b)
	{
		if (b.indexOf(a) > -1)
		{
			throw new Error("[GGExtraEmotes] InfinityReplaces in Replace('" + str + "', '" + a + "', '" + b + "')");
		}
		var new_str = CopyStrByValue(str);
		while (new_str.indexOf(a) > -1)
		{
			new_str = new_str.replace(a, b);
		}
		return new_str;
	}

	function IsHTMLElement(obj)
	{
		try { return obj instanceof HTMLElement; }
		catch(e) { return false; }
	}

	function CopyStrByValue(str) { return str.valueOf(); }
})();
