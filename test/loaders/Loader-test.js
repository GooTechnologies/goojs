define([
	'goo/util/Ajax',
	'goo/loaders/Loader',
	'goo/lib/rsvp.amd'
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


		it('loads application/octet-stream', function() {
			xhr.get = function(arg) {
				var p = new RSVP.Promise();

				p.resolve({
					getResponseHeader: function() {
						return 'application/octet-stream';
					},
					responseText: 'Beemo'
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

		it('loads application/json to object', function() {
			xhr.get = function(arg) {
				var p = new RSVP.Promise();

				p.resolve({
					getResponseHeader: function() {
						return 'application/json';
					},
					responseText: '{"foo":"bar"}'
				});

				return p;
			};

			var p = loader.load('test.json');

			waitsFor(function() {
				return p.isResolved;
			}, 'promise does not get resolved', 1);

			p.then(function(data) {
				expect(data).toEqual({foo:"bar"});
			});
		});

		it('gets rejected when it doesn\'t recognize a content type', function() {
			xhr.get = function(arg) {
				var p = new RSVP.Promise();

				p.resolve({
					getResponseHeader: function() {
						return 'something';
					},
					responseText: '{"foo":"bar"}'
				});

				return p;
			};

			var p = loader.load('data');

			waitsFor(function() {
				return p.isRejected;
			}, 'promise does not get rejected', 1);
		});

		it('parses loaded data with parse function', function() {
			xhr.get = function(arg) {
				var p = new RSVP.Promise();

				p.resolve({
					getResponseHeader: function() {
						return 'application/json';
					},
					responseText: '{"foo":"bar"}'
				});

				return p;
			};

			var p = loader.load('test.json', function(data) {
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