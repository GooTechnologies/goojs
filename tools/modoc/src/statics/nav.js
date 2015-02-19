(function () {
	'use strict';

	function setActiveClass(element) {
		if (activeClass !== element) {
			if (activeClass) { activeClass.classList.remove('active'); }
			element.classList.add('active');
			activeClass = element;
		}
	}

	function itemClickListener() {
		iframe.contentWindow.postMessage(this.innerText, '*');
		setActiveClass(this.parentNode);
	}

	function compareStrings(a, b) {
		return a < b ? -1 : a > b ? 1 : 0;
	}

	var scoringCriteria = [
		// 'exact match'
		function (pattern, text) {
			if (text === pattern) {
				return 4;
			} else {
				return 0;
			}
		},
		// 'starts with'
		function (pattern, text) {
			if (text.slice(0, pattern.length) === pattern) {
				return 2;
			} else {
				return 0;
			}
		},
		// 'contains'
		function (pattern, text) {
			if (text.indexOf(pattern) !== -1) {
				return 1;
			} else {
				return 0;
			}
		}
		// 'initials match' ?
	];

	function displaySearchResults(pattern) {
		pattern = pattern.toLowerCase();
		resultsContainer.empty();

		function computeScore(pattern, text) {
			text = text.toLowerCase();

			return scoringCriteria.reduce(function (prev, cur) {
				return prev + cur(pattern, text);
			}, 0);
		}

		var entries = Object.keys(anchorsByName).map(function (name) {
			return {
				name: name,
				score: computeScore(pattern, name)
			};
		});

		// filter entries with bad score
		var results = entries.filter(function (entry) {
			return entry.score > 0;
		});

		results.sort(function (a, b) {
			if (b.score === a.score) {
				return compareStrings(a.name.toLowerCase(), b.name.toLowerCase());
			} else {
				return b.score - a.score;
			}
		});

		results.forEach(function (entry) {
			var listItem = $('<li class="item"></li>');
			var anchor = $('<a>' + entry.name + '</a>');
			listItem.append(anchor);
			anchor.click(itemClickListener);
			resultsContainer.append(listItem);
		});
	}

	function setupSearch() {
		searchInput.keyup(function () {
			searchText = $(this).val();

			if (searchText.length > 0) {
				indexContainer.hide();
				resultsContainer.show();
			} else {
				indexContainer.show();
				resultsContainer.hide();
			}

			displaySearchResults(searchText);
		});
	}

	function setupIframe() {
		items.each(function (index, item) {
			item = $(item);

			item.find('a').click(itemClickListener);
		});
	}

	function setupActiveClass() {
		var anchorsByName = {};

		window.addEventListener('message', function (event) {
			var element;

			if (searchText.length > 0) {
				element = resultsContainer.find('a').filter(function (index, element) {
					return element.innerText === event.data;
				})[0];
			} else {
				element = anchorsByName[event.data];
			}

			element.scrollIntoView();
			setActiveClass(element.parentNode);
		});

		items.find('a').each(function (index, item) {
			item = $(item);

			item.click(function () {
				setActiveClass(this.parentNode);
			});

			anchorsByName[item.text()] = item[0];
		});

		return anchorsByName;
	}

	var activeClass;
	var iframe = $('iframe.class-panel')[0];
	var items = $('.item');
	var searchInput = $('#search');
	var indexContainer = $('.index-container');
	var resultsContainer = $('.results-container').children('ul');
	var searchText = '';

	var parameters = window.purl().param();
	if (parameters.c) {
		iframe.addEventListener('load', function () {
			iframe.contentWindow.postMessage(parameters.c, '*');
		});
	}

	var anchorsByName = setupActiveClass();

	setupSearch();
	setupIframe();
})();