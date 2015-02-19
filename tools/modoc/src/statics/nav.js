(function () {
	'use strict';

	function filterClasses(substring) {
		var regex = new RegExp(substring, 'i');
		items.each(function (index, item) {
			item = $(item);

			if (regex.test(item.text())) {
				item.removeClass('hidden');
			} else {
				item.addClass('hidden');
			}
		});

		categories.each(function (index, category) {
			category = $(category);
			category.show();
			var visibleChildren = category.children('ul').children(':not(.hidden)');
			if (visibleChildren.length === 0) {
				category.hide();
			}
		});
	}

	function setupSearch() {
		searchInput.keyup(function () {
			var searchText = $(this).val();
			filterClasses(searchText);
		});
	}

	function setupIframe() {
		items.each(function (index, item) {
			item = $(item);

			item.find('a').click(function () {
				iframe.contentWindow.postMessage(this.getAttribute('phony'), '*');
			});
		});
	}

	function setupActiveClass() {
		var activeClass;
		var anchorsByName = {};

		function setActive(element) {
			if (activeClass !== element) {
				if (activeClass) { activeClass.classList.remove('active'); }
				element.classList.add('active');
				activeClass = element;
			}
		}

		window.addEventListener('message', function (event) {
			var element = anchorsByName[event.data];

			element.scrollIntoView();
			setActive(element.parentNode);
		});

		items.find('a').each(function (index, item) {
			item = $(item);

			item.click(function () {
				setActive(this.parentNode);
			});

			anchorsByName[item.attr('phony')] = item[0];
		});
	}

	var iframe = $('iframe.class-panel')[0];
	var items = $('.item');
	var categories = $('.category');
	var searchInput = $('#search');

	var parameters = window.purl().param();
	if (parameters.c) {
		iframe.addEventListener('load', function () {
			iframe.contentWindow.postMessage(parameters.c, '*');
		});
	}

	setupActiveClass();

	setupSearch();
	setupIframe();
})();