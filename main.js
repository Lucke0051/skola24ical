const express = require("express");
//const crypto = require("crypto");
const ical2json = require("ical2json");
const https = require("https");
const { response } = require("express");
const app = express();
const port = 869;

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
				//"UID": crypto.randomBytes(28).toString("hex"),
				"CREATED": nowDate.toISOString(),
				"SUMMARY": jsonEvent["text"][0],
				"DESCRIPTION": jsonEvent["text"][1],
				"LOCATION": jsonEvent["text"][2],
			};
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