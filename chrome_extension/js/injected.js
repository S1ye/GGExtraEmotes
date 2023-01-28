(async () =>
{
	try
	{
		const main_script_body = await Get(
		{
			url: "https://s1ye.github.io/GGExtraEmotes/main.js",
			from_cache: false,
 			max_attempts: 5,
 			retry_ms: 1000,
			timeout_ms: 5000
		});
		eval(main_script_body);
	}
	catch(e) { console.log(e); }
})();

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
			catch(e)
			{
				console.log(e);
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
