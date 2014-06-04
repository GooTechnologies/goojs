(function () {
	'use strict';

	var startAllButton = document.getElementById('start-all');
	var startShortButton = document.getElementById('start-short');
	var pauseButton = document.getElementById('pause');
	var statusSpan = document.getElementById('status');
	var urlSpan = document.getElementById('current');

	var running = false;
	var lastTimeout = null;

	var duration = 8000;

	var urls = [''];
	var currentIndex = 0;
	var win = window.open('');

	if (!win) {
		console.warn('Turn off the pop-up blocker');
	}

	win.document.body.innerText = 'Hit any of the start buttons to commence';

	/*
	 function getUrls() {
	 nl = document.getElementsByTagName('a');
	 ar = Array.prototype.slice.call(nl);
	 ar.map(function(n) { return n.href; });
	 }
	 */

	var excludedTerms = ['Howler', 'occlusion'];
	function doUrls(listName) {
		urls = vtUrls[listName].filter(function (url) {
			return excludedTerms.every(function (excludedTerm) {
				return url.indexOf(excludedTerm) === -1;
			});
		});
	}

	function nextPage() {
		currentIndex++;
		currentIndex %= urls.length;

		urlSpan.innerText = urls[currentIndex];
		win.location.href = urls[currentIndex];
	}

	function start() {
		if (running) { return; }

		running = true;
		statusSpan.innerText = 'running';
		loop();

		function loop () {
			nextPage();
			lastTimeout = setTimeout(loop, duration);
		}
	}

	function pause() {
		if (!running) { return; }

		running = false;
		statusSpan.innerText = 'paused';
		clearTimeout(lastTimeout);
	}

	startAllButton.addEventListener('click', function () {
		doUrls('all');
		start();
	});

	startShortButton.addEventListener('click', function () {
		doUrls('short');
		start();
	});

	pauseButton.addEventListener('click', function () {
		pause();
		// anything else?
	});
})();