define([
	'goo/util/Ajax',
	'goo/lib/rsvp.amd'
	],
	function(
		Ajax,
		RSVP
		) {
		'use strict';

		var TestResponses = {
			'good-url' : {
				readyState : 4,
				status : 200,
				responseText : 'This was nice.',
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

				a.then(function(request) {
					expect(a.reject).not.toHaveBeenCalled();
					expect(a.resolve).toHaveBeenCalled();
					// REVIEW: MockXHR is not defined. How can this expect succeed?
					expect(request.responseText instanceof MockXHR).toBeTruthy();
					// REVIEW: If any of the expects above fails,
					// it is reported as an error of another test!
					// Wait for the promise to be resolved before considering the test done.
					// E.g. with waitsFor
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

				a.then(null, function(request) {
					expect(a.resolve).not.toHaveBeenCalled();
					expect(a.reject).toHaveBeenCalled();
					expect(request.responseText instanceof MockXHR).toBeTruthy();
				});
			});
		});
});