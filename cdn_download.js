
const execSync = require('child_process').execSync;
const fs = require('fs');

var libs = {
	"ajax.googleapis.com/ajax/libs/angularjs/VER/angular.min.js":
	["1.7.8", "1.7.7", "1.7.6", "1.7.5", "1.7.4", "1.7.3", "1.7.2", "1.7.1", "1.7.0", 
	"1.6.10", "1.6.9", "1.6.8", "1.6.7", "1.6.6", "1.6.5", "1.6.4", "1.6.3", "1.6.2", "1.6.1", "1.6.0"],
	"cdnjs.cloudflare.com/ajax/libs/angular.js/VER/angular.min.js": 
	["1.7.8", "1.7.7", "1.7.6", "1.7.5", "1.7.4", "1.7.3", "1.7.2", "1.7.1", "1.7.0", 
	"1.6.10", "1.6.9", "1.6.8", "1.6.7", "1.6.6", "1.6.5", "1.6.4", "1.6.3", "1.6.2", "1.6.1", "1.6.0"],
	"stackpath.bootstrapcdn.com/bootstrap/VER/js/bootstrap.min.js":
	["4.3.1", "4.3.0", "4.2.1", "4.2.0", "4.1.3", "4.1.2", "4.1.1", "4.1.0", "4.0.0", "3.4.1", "3.4.0", "3.3.7", "3.3.6"],
	"cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/VER/js/bootstrap.min.js":
	["4.3.1", "4.3.0", "4.2.1", "4.2.0", "4.1.3", "4.1.2", "4.1.1", "4.1.0", "4.0.0", "3.4.1", "3.4.0", "3.3.7", "3.3.6", "3.3.5"],
	"ajax.googleapis.com/ajax/libs/jquery/VER/jquery.min.js":
	["3.4.0", "3.3.1", "3.3.0", "3.2.1", "3.2.0", "3.1.1", "3.1.0", "3.0.0", "2.2.4", "2.2.3", "2.2.2", "2.2.1", "2.2.0",
	"2.1.4", "2.1.3" ,"2.1.2", "2.1.1", "2.1.0", "2.0.3"],
	"cdnjs.cloudflare.com/ajax/libs/jquery/VER/jquery.min.js":
	["3.4.0", "3.3.1", "3.3.0", "3.2.1", "3.2.0", "3.1.1", "3.1.0", "3.0.0", "2.2.4", "2.2.3", "2.2.2", "2.2.1", "2.2.0",
	"2.1.4", "2.1.3" ,"2.1.2", "2.1.1", "2.1.0", "2.0.3"],
	"www.google-analytics.com/analytics.js": ["1.0"],
	"static.doubleclick.net/instream/ad_status.js": ["1.0"],
	"unpkg.com/react@VER/umd/react.production.min.js": ["16", "15", "14", "13", "12"],
	"cdnjs.cloudflare.com/ajax/libs/react-dom/VER/umd/react-dom.production.min.js": 
	["16.8.6", "16.8.5", "16.8.4", "16.8.3", "16.8.2", "16.8.1", "16.7.0", "16.6.3", "16.6.2", "16.6.1", "16.5.2", "16.5.1", 
	"16.4.2", "16.4.1", "16.3.3", "16.3.2", "16.3.1"],
	"cdnjs.cloudflare.com/ajax/libs/modernizr/VER/modernizr.min.js":
	["2.8.3", "2.8.2", "2.8.1", "2.8.0", "2.7.2", "2.7.1", "2.7.0", "2.6.3", "2.6.2"]


};


var cdn_list = "";
for (var x in libs) {
    var vers = libs[x];
    var e = x.replace(/\//g, "__");

    for (var z in vers) {
        var v = vers[z];
        var x2 = x.replace("VER", v);
        var e2 = e.replace("VER", v);

        console.log("downloading: " + x2);
        execSync("curl " + x2 + " > js/"+e2 +" &2>/dev/null");
        var s = fs.statSync("js/" + e2);
        if (s.size < 1000) {
            console.log("error downloading: " + x2);
            execSync("rm js/" + e2);
        }
        else {
            cdn_list += '"' + x2 + '",\n';
        }
    }
}

//execSync("cp target_injected_xhtmljs.html tarrget_injected_xhtmljs.bak");
var xhtml = fs.readFileSync(__dirname + '/target_injected_xhtmljs.html').toString();
if (!xhtml) {
    process.exit(console.log("Couldn't read target_injected_xhtmljs.html"));
}

var newhtml = xhtml.replace("CDN_REPLACEMENT", cdn_list);
fs.writeFileSync(__dirname + '/updated.html', newhtml, {flags : 'w'});
console.log("finished.   Please review updated.html and rename to target_injected_xhtmljs.html if everything looks okay");




