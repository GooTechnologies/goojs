define([
	'goo/util/Ajax'
	],
	function(
		Ajax
		) {
		'use strict';

		var TestResponses = {
			'good-url' : {
				readyState : 4,
				status : 200,
				responseText : 'Successful response.',
				responseHeader : {
					'Content-Type' : 'application/text'
				}
			}
		};


		function createMockXhr(mockResponses) {
			function MockXHR() {

			}

			MockXHR.prototype.open = function(method, url) {
				this.url = url;
			};

			MockXHR.prototype.send = function() {
				if(!mockResponses[this.url])
				{
					this.readyState = 4;
					this.status = 404;
					this.statusText = 'Couldn\'t find a fake response: ' + this.url;
					this.onreadystatechange();
					return;
				}

				var response = mockResponses[this.url];

				for(var key in response)
				{
					this[key] = response[key];
				}

				this.onreadystatechange();
			};

			MockXHR.prototype.getResponseHeader = function(header) {
				return this.responseHeader[header] ? this.responseHeader[header] : null;
			};

			MockXHR.prototype.addEventListener = function() {
			};

			return MockXHR;
		}

		describe('Ajax', function() {

			beforeEach(function() {
				spyOn(window, 'XMLHttpRequest').andCallFake(function() {
					var mockXHR = createMockXhr(TestResponses);
					return mockXHR.prototype;
				});
			});

			it('resolves with the request as argument when the request is successful', function() {

				var ajaxSettings = {
					url: 'good-url',
					method: 'GET',
					async: true
				};

				var a = new Ajax().get(ajaxSettings);

				spyOn(a, 'resolve').andCallThrough();

				waitsFor(function() {
					return a.isResolved;
				}, 'promise does not get resolved', 1);

				a.then(function(data) {
					expect(data.responseText).toEqual('Successful response.');
				});
			});


			it('resolves with the request as argument when the request is unsuccessful', function() {

				var ajaxSettings = {
					url: 'nonexistent-url',
					method: 'GET',
					async: true
				};

				var a = new Ajax().get(ajaxSettings);

				spyOn(a, 'reject').andCallThrough();

				waitsFor(function() {
					return a.isRejected;
				}, 'promise does not get rejected', 1);

				a.then(null, function(reason) {
					expect(reason).toEqual('Couldn\'t find a fake response: ' + ajaxSettings.url);
				});
			});

			it('parses URLs', function () {
				var url = 'http://example.com:1234/images/goo.png?param=1#fragment';
				var parts = Ajax.parseURL(url);
				expect(parts.scheme).toEqual('http');
				expect(parts.domain).toEqual('example.com');
				expect(parts.user_info).toBeFalsy();
				expect(parts.port).toEqual('1234');
				expect(parts.path).toEqual('/images/goo.png');
				expect(parts.query_data).toEqual('param=1');
				expect(parts.fragment).toEqual('fragment');
			});

			it('removes parameters from URLs', function () {
				var url = 'http://example.com:1234/images/goo.png?param=1#fragment';
				var stripped = Ajax.removeParamsFromURL(url);
				expect(stripped).toEqual('http://example.com:1234/images/goo.png');

				expect(Ajax.removeParamsFromURL('')).toEqual('');
				expect(Ajax.removeParamsFromURL('../images/goo.png?a=1')).toEqual('../images/goo.png');
			});
		});
});