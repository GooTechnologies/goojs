'use strict';

var fs = require('fs');
var http = require('http');


http.createServer(function (request, response) {
	console.log('request url', request.url);

	response.writeHeader(200, { 'Content-Type': 'text/plain' });

	if (request.url === '/ok') {
		log('OK');
		response.write('OK');
	} else if (request.url === '/fail') {
		log('FAIL');
		response.write('OK');
	} else {
		response.write('only /ok or /fail are supported');
	}

	response.end();
}).listen(8004);


function log(status) {
	fs.appendFile('e2e-log.txt', status + ' - ' + new Date() + '\n');
}