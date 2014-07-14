define([
	"goo/util/StringUtil"
], function(
	StringUtil
) {
	"use strict";

	describe("StringUtil", function() {
		it('parses URLs', function () {
			var url = 'http://example.com:1234/images/goo.png?param=1#fragment';
			var parts = StringUtil.parseURL(url);
			expect(parts.scheme).toEqual('http');
			expect(parts.domain).toEqual('example.com');
			expect(parts.user_info).toBeFalsy();
			expect(parts.port).toEqual('1234');
			expect(parts.path).toEqual('/images/goo.png');
			expect(parts.query_data).toEqual('param=1');
			expect(parts.fragment).toEqual('fragment');
		});
	});
});