(function () {
	'use strict';

	// should instead use angular

	var entryList = document.getElementById('container');

	function clearList() {
		while (entryList.firstChild) {
			entryList.removeChild(entryList.firstChild);
		}
	}

	function processLog(log) {
		clearList();

		var lines = log.split('\n');
		lines.pop(); // last line is empty
		lines.reverse();

		lines.forEach(function (line) {
			// extract the data
			var separator = line.indexOf('-');
			var status = line.slice(0, separator - 1);
			var date = line.slice(separator + 2);

			// build the html elements
			var entryNode = document.createElement('div');
			entryNode.classList.add('entry');

			var statusNode = document.createElement('span');
			statusNode.classList.add(status === 'OK' ? 'status-ok' : 'status-fail');
			statusNode.innerText = status;

			var dateNode = document.createElement('span');
			dateNode.classList.add('date');
			dateNode.innerText = date;

			// display them
			entryNode.appendChild(statusNode);
			entryNode.appendChild(dateNode);

			entryList.appendChild(entryNode);
		});
	}

	var refreshDelay = 1000 * 60 * 5; // 5 mins

	function refresh() {
		var request = new XMLHttpRequest();

		request.onload = function () {
			processLog(this.response);
		};

		request.open('GET', 'e2e-log.txt', true);
		request.send();

		setTimeout(refresh, refreshDelay);
	}

	refresh();
})();
