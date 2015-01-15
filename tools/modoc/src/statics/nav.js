(function () {
	'use strict';

	function filterClasses(substring) {
		var regex = new RegExp(substring, 'i');
		items.each(function (index, item) {
			item = $(item);

			if (regex.test(item.text())) {
				item.show();
			} else {
				item.hide();
			}
		});
	}

	function setupSearch() {
		var searchText = '';

		if (parameters.q) {
			searchText = parameters.q;
			searchInput.val(parameters.q);
			filterClasses(parameters.q);
		}

		searchInput.keyup(function () {
			searchText = $(this).val();
			filterClasses(searchText);
		});
	}

	function setupIframe() {
		items.each(function (index, item) {
			item = $(item);

			item.find('a').click(function () {
				iframe.attr('src', item.find('a').attr('phony'));
			});
		});
	}

	var iframe = $('iframe.class-panel');
	var items = $('.item');
	var searchInput = $('#search');
	var parameters = purl().param();

	setupSearch();
	setupIframe();
})();