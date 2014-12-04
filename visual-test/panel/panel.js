(function () {
	'use strict';

	var IFRAME_WIDTH = 384;
	var IFRAME_HEIGHT = 256;
	var MAX_IFRAMES = 4;

	var vtList = adaptUrls(window.vtUrls.all.slice(0));

	var offset = purl().param().offset || 0;

	var iframes;

	function adaptUrl(url) {
		return url.replace('http://127.0.0.1:8003', window.location.origin) + '?minimal=t';
	}

	function adaptUrls(urls) {
		return urls.map(function (url) {
			return adaptUrl(url);
		});
	}

	function createIframes() {
		var iframes = [];

		for (var i = 0; i < MAX_IFRAMES; i++) {
			var iframe = document.createElement('iframe');
			iframe.width = IFRAME_WIDTH;
			iframe.height = IFRAME_HEIGHT;
			document.body.appendChild(iframe);
			iframes.push(iframe);
		}

		return iframes;
	}

	function setSources(iframes, list, start) {
		console.log(start);
		for (var i = 0; i < MAX_IFRAMES; i++) {
			var safeIndex = (i + start) % list.length;
			iframes[i].src = list[safeIndex];
		}
	}

	function setupGui() {
		var prevButton = document.getElementById('prev');
		prevButton.addEventListener('click', function () {
			offset += vtList.length - MAX_IFRAMES;
			offset %= vtList.length;
			setSources(iframes, vtList, offset);
		});

		var nextButton = document.getElementById('next');
		nextButton.addEventListener('click', function () {
			offset += MAX_IFRAMES;
			offset %= vtList.length;
			setSources(iframes, vtList, offset);
		});
	}

	function setup() {
		setupGui();
		iframes = createIframes();
		setSources(iframes, vtList, 0);
	}

	setup();
})();