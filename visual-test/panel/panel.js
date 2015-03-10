(function () {
	'use strict';

	var IFRAME_WIDTH = 384;
	var IFRAME_HEIGHT = 256;
	var MAX_IFRAMES = 12;

	var vtList = adaptUrls(window.vtUrls.all.slice(0));

	var offset = +purl().param().offset || 0;

	var containers;

	function adaptUrl(url) {
		return '../' + url + '?minimal=t';
	}

	function adaptUrls(urls) {
		return urls.map(adaptUrl);
	}

	function createIframes() {
		var containers = [];

		for (var i = 0; i < MAX_IFRAMES; i++) {
			var container = document.createElement('div');
			container.classList.add('container');

			var iframe = document.createElement('iframe');
			iframe.width = IFRAME_WIDTH;
			iframe.height = IFRAME_HEIGHT;
			container.appendChild(iframe);

			var br = document.createElement('br');
			container.appendChild(br);

			var title = document.createElement('a');
			title.classList.add('title');
			container.appendChild(title);

			document.body.appendChild(container);

			containers.push({ iframe: iframe, title: title });
		}

		return containers;
	}

	function setSources(containers, list, offset) {
		for (var i = 0; i < MAX_IFRAMES; i++) {
			var safeIndex = (i + offset) % list.length;

			// update iframe source
			containers[i].iframe.src = list[safeIndex];

			// update title
			var vtestName = list[safeIndex].match(/\/([\w\-]+)\.html/)[1];
			containers[i].title.innerText = vtestName;

			// update href with full address - strip the 'minimal' option
			var fullUrl = list[safeIndex].slice(0, list[safeIndex].length - '?minimal=t'.length);
			containers[i].title.href = fullUrl;
		}

		window.history.replaceState('Object', 'Title', 'index.html?offset=' + offset);
	}

	function setupGui() {
		var prevButton = document.getElementById('prev');
		prevButton.addEventListener('click', function () {
			offset += vtList.length - MAX_IFRAMES;
			offset %= vtList.length;
			setSources(containers, vtList, offset);
		});

		var nextButton = document.getElementById('next');
		nextButton.addEventListener('click', function () {
			offset += MAX_IFRAMES;
			offset %= vtList.length;
			setSources(containers, vtList, offset);
		});
	}

	function setup() {
		setupGui();
		containers = createIframes();
		setSources(containers, vtList, offset);
	}

	setup();
})();