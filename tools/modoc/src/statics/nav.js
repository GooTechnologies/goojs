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
		searchInput.keyup(function () {
			var searchText = $(this).val();
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
	if (parameters.c) {
		iframe.attr('src', parameters.c + '-doc.html');
	}

	setupSearch();
	setupIframe();
})();