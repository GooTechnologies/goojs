define(
[
	"goo/util/URLTools"
], function(
	URLTools
) {
	'use strict';

	describe('URLTools', function() {
		describe('getDirectory', function() {

			it('returns the URL to the last slash', function() {
				expect(URLTools.getDirectory('http://server/foo/bar/index.html'))
					.toEqual('http://server/foo/bar/');
			});

			it('appends slash to URLs without a slash', function() {
				expect(URLTools.getDirectory('relative'))
					.toEqual('relative/');
			});
		});
	});
});
