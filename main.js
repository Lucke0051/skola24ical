const express = require("express");
const crypto = require("crypto");
const ical2json = require("ical2json");
const https = require("https");
const { response } = require("express");
const app = express();
const port = 8869;

function getWeekNumber(d) {
	d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
	d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
	var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
	var weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
	//return [d.getUTCFullYear(), weekNo];
	return weekNo;
}

function jsonDayToJsonIcalEvent(data, nowDate) {
	try {
		var dateSplit = data["date"].split("/");
		var events = [];
		var year = nowDate.getFullYear()
		for (let index = 0; index < data["events"].length; index++) {
			const jsonEvent = data["events"][index];
			var month = dateSplit[1];
			if (month.length == 1) {
				month = "0" + month;
			}
			var day = dateSplit[0];
			if (day.length == 1) {
				day = "0" + day;
			}
			var eventStart = year + month + day + "T" + (jsonEvent["start"].replace(/:/g, ""));
			var eventEnd = year + month + day + "T" + (jsonEvent["end"].replace(/:/g, ""));
			var stamp = nowDate.toISOString().replace(/[^\w\s]/gi, "");
			var event = {
				"DTSTART": eventStart,
				"DTEND": eventEnd,
				"DTSTAMP": stamp.substring(0, stamp.length - 4),
				"UID": md5(eventStart + eventEnd + jsonEvent["text"][0]),
				//"CREATED": nowDate.toISOString(),
				"SUMMARY": jsonEvent["text"][0],
			};
			if (jsonEvent["text"][1]) {
				event["DESCRIPTION"] = jsonEvent["text"][1];
			}
			if (jsonEvent["text"][2]) {
				event["LOCATION"] = jsonEvent["text"][2];
			}
			events.push(event);
		}
		return events;
	} catch (error) {
		console.log(error);
	}
	return null;
}

app.get("/ical", function (request, response) {
	var weekNum = request.query["weeks"];
	if (weekNum) {
		weekNum = parseInt(weekNum);
	} else {
		weekNum = 1;
	}
	if (request.query["id"]) {
		const todaysDate = new Date();
		const currentYear = todaysDate.getFullYear();
		const preCurrentWeek = getWeekNumber(todaysDate);
		var jsonIcalEvents = [];

		var requestsDone = [];
		for (let i = 0; i < weekNum; i++) {
			var currentWeek = preCurrentWeek + i;
			var path = "/api/schedule?id=" + request.query["id"] + "&year=" + currentYear + "&week=" + currentWeek;
			console.log("GET " + path);

			var options = {
				hostname: "lufs.nu",
				port: 443,
				path: path,
				method: "GET"
			}

			var req = https.request(options, res => {
				console.log(`Request status code: ${res.statusCode}`);
				res.on("data", d => {
					var json = JSON.parse(d);
					for (let index = 0; index < json.length; index++) {
						var jsonDayIcalEvents = jsonDayToJsonIcalEvent(json[index], todaysDate);
						if (jsonDayIcalEvents) {
							jsonIcalEvents = jsonIcalEvents.concat(jsonDayIcalEvents);
						}
					}
					if (requestsDone.length == (weekNum - 1)) {
						var jsonIcal = {
							"VCALENDAR": [
								{
									"PRODID": "-//Shema2Ical//Schema//SE",
									"VERSION": "2.0",
									"CALSCALE": "GREGORIAN",
									"METHOD": "PUBLISH",
									"X-WR-CALNAME": "Schema",
									"X-WR-TIMEZONE": "Europe/Stockholm",
									"VEVENT": jsonIcalEvents,
								}
							]
						}
						response.setHeader("Content-Type", "text/calendar");
						var reverted = ical2json.revert(jsonIcal);
						response.send(reverted);
					} else {
						requestsDone.push(i);
					}
				})
			})

			req.on("error", error => {
				console.error(error);
			})

			req.end();
		}
	} else {
		response.sendStatus(400);
	}
})

app.listen(port);

function md5cycle(x, k) {
	var a = x[0], b = x[1], c = x[2], d = x[3];

	a = ff(a, b, c, d, k[0], 7, -680876936);
	d = ff(d, a, b, c, k[1], 12, -389564586);
	c = ff(c, d, a, b, k[2], 17, 606105819);
	b = ff(b, c, d, a, k[3], 22, -1044525330);
	a = ff(a, b, c, d, k[4], 7, -176418897);
	d = ff(d, a, b, c, k[5], 12, 1200080426);
	c = ff(c, d, a, b, k[6], 17, -1473231341);
	b = ff(b, c, d, a, k[7], 22, -45705983);
	a = ff(a, b, c, d, k[8], 7, 1770035416);
	d = ff(d, a, b, c, k[9], 12, -1958414417);
	c = ff(c, d, a, b, k[10], 17, -42063);
	b = ff(b, c, d, a, k[11], 22, -1990404162);
	a = ff(a, b, c, d, k[12], 7, 1804603682);
	d = ff(d, a, b, c, k[13], 12, -40341101);
	c = ff(c, d, a, b, k[14], 17, -1502002290);
	b = ff(b, c, d, a, k[15], 22, 1236535329);

	a = gg(a, b, c, d, k[1], 5, -165796510);
	d = gg(d, a, b, c, k[6], 9, -1069501632);
	c = gg(c, d, a, b, k[11], 14, 643717713);
	b = gg(b, c, d, a, k[0], 20, -373897302);
	a = gg(a, b, c, d, k[5], 5, -701558691);
	d = gg(d, a, b, c, k[10], 9, 38016083);
	c = gg(c, d, a, b, k[15], 14, -660478335);
	b = gg(b, c, d, a, k[4], 20, -405537848);
	a = gg(a, b, c, d, k[9], 5, 568446438);
	d = gg(d, a, b, c, k[14], 9, -1019803690);
	c = gg(c, d, a, b, k[3], 14, -187363961);
	b = gg(b, c, d, a, k[8], 20, 1163531501);
	a = gg(a, b, c, d, k[13], 5, -1444681467);
	d = gg(d, a, b, c, k[2], 9, -51403784);
	c = gg(c, d, a, b, k[7], 14, 1735328473);
	b = gg(b, c, d, a, k[12], 20, -1926607734);

	a = hh(a, b, c, d, k[5], 4, -378558);
	d = hh(d, a, b, c, k[8], 11, -2022574463);
	c = hh(c, d, a, b, k[11], 16, 1839030562);
	b = hh(b, c, d, a, k[14], 23, -35309556);
	a = hh(a, b, c, d, k[1], 4, -1530992060);
	d = hh(d, a, b, c, k[4], 11, 1272893353);
	c = hh(c, d, a, b, k[7], 16, -155497632);
	b = hh(b, c, d, a, k[10], 23, -1094730640);
	a = hh(a, b, c, d, k[13], 4, 681279174);
	d = hh(d, a, b, c, k[0], 11, -358537222);
	c = hh(c, d, a, b, k[3], 16, -722521979);
	b = hh(b, c, d, a, k[6], 23, 76029189);
	a = hh(a, b, c, d, k[9], 4, -640364487);
	d = hh(d, a, b, c, k[12], 11, -421815835);
	c = hh(c, d, a, b, k[15], 16, 530742520);
	b = hh(b, c, d, a, k[2], 23, -995338651);

	a = ii(a, b, c, d, k[0], 6, -198630844);
	d = ii(d, a, b, c, k[7], 10, 1126891415);
	c = ii(c, d, a, b, k[14], 15, -1416354905);
	b = ii(b, c, d, a, k[5], 21, -57434055);
	a = ii(a, b, c, d, k[12], 6, 1700485571);
	d = ii(d, a, b, c, k[3], 10, -1894986606);
	c = ii(c, d, a, b, k[10], 15, -1051523);
	b = ii(b, c, d, a, k[1], 21, -2054922799);
	a = ii(a, b, c, d, k[8], 6, 1873313359);
	d = ii(d, a, b, c, k[15], 10, -30611744);
	c = ii(c, d, a, b, k[6], 15, -1560198380);
	b = ii(b, c, d, a, k[13], 21, 1309151649);
	a = ii(a, b, c, d, k[4], 6, -145523070);
	d = ii(d, a, b, c, k[11], 10, -1120210379);
	c = ii(c, d, a, b, k[2], 15, 718787259);
	b = ii(b, c, d, a, k[9], 21, -343485551);

	x[0] = add32(a, x[0]);
	x[1] = add32(b, x[1]);
	x[2] = add32(c, x[2]);
	x[3] = add32(d, x[3]);

}

function cmn(q, a, b, x, s, t) {
	a = add32(add32(a, q), add32(x, t));
	return add32((a << s) | (a >>> (32 - s)), b);
}

function ff(a, b, c, d, x, s, t) {
	return cmn((b & c) | ((~b) & d), a, b, x, s, t);
}

function gg(a, b, c, d, x, s, t) {
	return cmn((b & d) | (c & (~d)), a, b, x, s, t);
}

function hh(a, b, c, d, x, s, t) {
	return cmn(b ^ c ^ d, a, b, x, s, t);
}

function ii(a, b, c, d, x, s, t) {
	return cmn(c ^ (b | (~d)), a, b, x, s, t);
}

function md51(s) {
	txt = '';
	var n = s.length,
		state = [1732584193, -271733879, -1732584194, 271733878], i;
	for (i = 64; i <= s.length; i += 64) {
		md5cycle(state, md5blk(s.substring(i - 64, i)));
	}
	s = s.substring(i - 64);
	var tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
	for (i = 0; i < s.length; i++)
		tail[i >> 2] |= s.charCodeAt(i) << ((i % 4) << 3);
	tail[i >> 2] |= 0x80 << ((i % 4) << 3);
	if (i > 55) {
		md5cycle(state, tail);
		for (i = 0; i < 16; i++) tail[i] = 0;
	}
	tail[14] = n * 8;
	md5cycle(state, tail);
	return state;
}

function md5blk(s) {
	var md5blks = [], i;
	for (i = 0; i < 64; i += 4) {
		md5blks[i >> 2] = s.charCodeAt(i)
			+ (s.charCodeAt(i + 1) << 8)
			+ (s.charCodeAt(i + 2) << 16)
			+ (s.charCodeAt(i + 3) << 24);
	}
	return md5blks;
}

var hex_chr = '0123456789abcdef'.split('');

function rhex(n) {
	var s = '', j = 0;
	for (; j < 4; j++)
		s += hex_chr[(n >> (j * 8 + 4)) & 0x0F]
			+ hex_chr[(n >> (j * 8)) & 0x0F];
	return s;
}

function hex(x) {
	for (var i = 0; i < x.length; i++)
		x[i] = rhex(x[i]);
	return x.join('');
}

function md5(s) {
	return hex(md51(s));
}

function add32(a, b) {
	return (a + b) & 0xFFFFFFFF;
}

if (md5('hello') != '5d41402abc4b2a76b9719d911017c592') {
	function add32(x, y) {
		var lsw = (x & 0xFFFF) + (y & 0xFFFF),
			msw = (x >> 16) + (y >> 16) + (lsw >> 16);
		return (msw << 16) | (lsw & 0xFFFF);
	}
}