#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var fs = require('fs'),
program = require('commander'),
cheerio = require('cheerio'),
rest = require('restler'),
HTMLFILE_DEFAULT = "index.html",
CHECKSFILE_DEFAULT = "checks.json",
assertFileExists = function (infile) {
    var instr = infile.toString();

    if (!fs.existsSync(instr)) {
	console.log("%s does not exist. Exiting.", instr);
	process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
	}
    return instr;
    },
cheerioContentHtml = function (contenthtml) {
    return cheerio.load(contenthtml);
    },
loadChecks = function (checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
    },
showJsonInConsole = function (json) {
    var outJson = JSON.stringify(json, null, 4);

    console.log(outJson);
    },
checkContentHtml = function (contenthtml, checksfile) {
    $ = cheerioContentHtml(contenthtml);
    var checks = loadChecks(checksfile).sort(),
    out = {},
    present;
    for (var ii in checks) {
	present = $(checks[ii]).length > 0;
	out[checks[ii]] = present;
	}
    return out;
    },
clone = function (fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
    };

if(require.main == module) {
    program
        .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
        .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
        .option('-u, --url <url_html_file>', 'Url to html file')
    .parse(process.argv);
    
    if (program.url === undefined) {
	var checkJson = checkContentHtml(fs.readFileSync(program.file), program.checks);
	
	showJsonInConsole(checkJson);
    } else {
	rest.get(program.url).on('complete', 
				 function (result, response) {
				     if (result instanceof Error) {
					 console.error('Error');
					 } else {
					     var checkJson = checkContentHtml(result, program.checks);
					     
					     showJsonInConsole(checkJson);
					     }
				     });
    }
} else {
    exports.checkContentHtml = checkContentHtml;
}
