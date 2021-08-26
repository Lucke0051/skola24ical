const https = require("https")

function httpRun() {
	const options = {
		hostname: "api-mobile01.skola24.se",
		port: 443,
		path: "",
		method: "POST",
		headersL: {
			"Accept": "application/json, text/plain, */*",
			"Content-Type": "application/json",
			"Authorization": "Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IkJCQjIyMDlGMTMzMEE3MDY2OTE5M0Q3NzU0MDVCNTlBOEJFRkE1N0QiLCJ0eXAiOiJhdCtqd3QiLCJ4NXQiOiJ1N0lnbnhNd3B3WnBHVDEzVkFXMW1vdnZwWDAifQ.eyJuYmYiOjE2Mjk5MTExMTgsImV4cCI6MTYyOTkxNDcxOCwiaXNzIjoiaHR0cHM6Ly9sb2dpbjAxLnNrb2xhMjQuc2UiLCJhdWQiOlsic2tvbGEyNC5jb21wb25lbnRzIiwic2tvbGEyNC53aWRnZXRzIiwic2tvbGEyNC5hcGkiXSwiY2xpZW50X2lkIjoic2tvbGEyNC5hcHAiLCJzdWIiOiJTRTIwMDUwNjIzMzI3OSIsImF1dGhfdGltZSI6MTYyOTcxMTkwMSwiaWRwIjoibTAwLW1nLWxvY2FsLmUyNC5vcmVicm8uc2VfZWxldiIsImNvdW50cnkiOiJTRSIsImxhbmd1YWdlIjoic3YiLCJjdWx0dXJlIjoic3YtU0UiLCJndWlkIjoiODZjZGMwZGItMGNhYy00YzgzLWE0N2QtYTM5ODUwYmQyMzk3IiwibmFtZSI6IlBhbGxoZWQsIEx1a2FzIiwiZW1haWwiOiJsdWthc0BwYWxsaGVkLnNlIiwic2tvbGEyNCI6ImpnSVozaGhTVkJLc1hKZFFDODJXTVJRZlZVQ3BjR2ozTStqdHZFWWxjOVhtREJITEx6N2liRGE0YXFYMG9OU0hMczZPWjh4K3BMeDM0V0RjcTZzbmJiOHBub2FxUHRYbk9kWTA2VVdyS0lYKy9WeTY1S1ZWMnR2L3pJU3VBcmdsTHVZL1paZGMwcHJPZ3RtcytvY1B5Mml4THphSGFQb3hQRENkOEhzU2t0dDArd1YzRlYrMkw4RzdJY3dRZDJFd3NlZXNNendqRlB6bmQ3MWUzYzNuQTFVZ3FQQ1VSSkkyRHBQTkxDVFNzUG89Iiwic2NvcGUiOlsib3BlbmlkIiwicHJvZmlsZSIsInNrb2xhMjQiLCJza29sYTI0LmNvbXBvbmVudHMiLCJza29sYTI0LndpZGdldHMiLCJza29sYTI0LmFwaSIsIm9mZmxpbmVfYWNjZXNzIl0sImFtciI6WyJleHRlcm5hbCJdLCJhY2Nlc3NfcmlnaHRzIjp7ImZmOTY2MGM4LWYzZjktNDY1YS1iODE3LWUzNzQyZjg5N2Q0MCI6eyJyIjozMiwiZSI6MCwibSI6NTM4NzM4MTE1fX19.CpYRlxMAni9HjpQFIZXCPr58_p9eU8dr9YVu5SRQxOhJnroQGKBgh9bYWEKV-0vN8HkqD4pDs98vJeUCg0imid9oXJwKech3l7KMfLOQNYH2dczJxVYzCcxuB00WZvu-rQAnu9wv5rDxHdZStmGu2FLZJRyqS8xst76LnmgheGoAtpMlcdh0Aa21QoUQUa8Xf28RPCbfV9n-L89SzLnU1HgoK9KQijHW1TDBuC1apQ2vjAHD4YjVFxyT--axfc5oBaem45jhZW94IkEvqUL-sY-Bp6MD1yNjdMwp9ssXs4lgo6lpr-9LylUJEZb1-1-Kvtonq-UFUn04cRloDP8Wow",
			"Accept-Language": "sv-SE,sv;q=0.9",
			"User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148",
		},
	}

	const req = https.request(options, res => {
		console.log(res.statusCode)
		res.on("data", d => {
			console.log(d)
		})

		res.on("error", error => {
			console.log(error)
		})


	})

	req.end('{"operationName":"getScheduleForUser","variables":{"localization":null},"query":"query getScheduleForUser($localization: String) {\n  menu {\n    all(localization: $localization) {\n      icon\n      id\n      route\n      sortOrder\n      title\n      update\n      url\n      userId\n      widgetName\n      widgetUrl\n      isExternal\n      __typename\n    }\n    __typename\n  }\n}\n"}')
}

httpRun();

/*{"operationName":"getScheduleForUser","variables":{"localization":null},"query":"query getScheduleForUser($localization: String) {\n  menu {\n    all(localization: $localization) {\n      icon\n      id\n      route\n      sortOrder\n      title\n      update\n      url\n      userId\n      widgetName\n      widgetUrl\n      isExternal\n      __typename\n    }\n    __typename\n  }\n}\n"}*/