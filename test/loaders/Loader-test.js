define([
	'goo/util/Ajax',
	'goo/loaders/Loader',
	'goo/util/rsvp'
	],
function(
	Ajax,
	Loader,
	RSVP
	) {
	'use strict';



	describe('Loader', function() {
		var loader;
		var xhr;



		beforeEach(function() {
			xhr = new Ajax();
			loader = new Loader({
				xhr: xhr
			});
		});


		it('return xhr.response from Ajax call', function() {
			xhr.get = function() {
				var p = new RSVP.Promise();

				p.resolve({
					response: 'Beemo'
				});

				return p;
			};

			var p = loader.load('test.glsl');

			waitsFor(function() {
				return p.isResolved;
			}, 'promise does not get resolved', 1);

			p.then(function(data) {
				expect(data).toEqual('Beemo');
			});
		});

		it('parses loaded data with parse function', function() {
			xhr.get = function() {
				var p = new RSVP.Promise();

				p.resolve({
					response: '{"foo":"bar"}'
				});

				return p;
			};

			var p = loader.load('test.json', function(data) {
				data = JSON.parse(data);
				data.foo = 'Adventure';
				return data;
			});

			waitsFor(function() {
				return p.isResolved;
			}, 'promise does not get resolved', 1);

			p.then(function(data) {
				expect(data).toEqual({foo:"Adventure"});
			});
		});
	});
});