define(function() {
	'use strict';

	/**
	 * Provides static functions for manipulating URLs.
	 */
	function URLTools() {}

	/**
	 * Extracts the "directory" of a URL or path.
	 * This is the URL up to and including the last '/'.
	 * If the URL does not contain a slash, just returns the url with
	 * a slash appended.
	 */
	URLTools.getDirectory = function(url) {
		var match = /.*\//.exec(url);
		if (!match) {
			return url + '/';
		}
		return match[0];
	};

	return URLTools;
});
