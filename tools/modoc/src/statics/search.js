(function () {
	'use strict';

	var searchInput;
	var items;
	var parameters;

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
		items = $('.item');
		searchInput = $('#search');

		var searchText = '';

		parameters = purl().param();
		if (parameters.q) {
			searchText = parameters.q;
			searchInput.val(parameters.q);
			filterClasses(parameters.q);
		}

		searchInput.keyup(function () {
			searchText = $(this).val();
			filterClasses(searchText);
		});

		items.each(function (index, item) {
			item = $(item);

			item.click(function (event) {
				event.preventDefault();
				window.location.href = item.find('a').attr('href') + '?q=' + searchText;
			});
		});
	}

	setupSearch();
})();