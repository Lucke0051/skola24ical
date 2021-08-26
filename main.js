function httpRun() {
	var xmlHttp = new XMLHttpRequest();
	xmlHttp.open("OPTIONS", "http://service-components01.skola24.se/", false);
	xmlHttp.send('');
	return xmlHttp.responseText;
}

document.getElementById("mainDiv").innerText = httpRun();