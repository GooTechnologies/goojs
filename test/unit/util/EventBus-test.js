define([
	"goo/util/EventBus"
], function(
	EventBus
) {
	"use strict";

	function Test() {
		this.name = 'Test';
	}
	Test.prototype.send = function (data) {
		this.fire('send', data);
	};
	EventBus.attach(Test.prototype);

	describe("EventBus", function() {
		var test;

		beforeEach(function () {
			test = new Test();
		});

		it('fire events', function () {
			var callback1 = function (source, data) {
				console.log('callback1 got data', source.name, data);
			};
			var callback2 = function (source, data) {
				console.log('callback2 got data', source.name, data);
			};
			var callback3 = function (source, data) {
				console.log('callback3 got data', source.name, data);
				source.off('send', this);
			};

			test.send(1);
			console.log('has send', test.has('send'));
			console.log('has asdf', test.has('asdf'));

			test.on('send', callback1);
			test.send(2);
			console.log('has send', test.has('send'));
			console.log('has asdf', test.has('asdf'));

			test.on('send', callback2);
			test.on('fish', callback1);
			test.send(3);
			console.log('has send', test.has('send'));
			console.log('has asdf', test.has('asdf'));

			test.off('send', callback1);
			test.send(4);
			console.log('has send', test.has('send'));
			console.log('has asdf', test.has('asdf'));

			test.off('send', callback2);
			test.send(5);
			console.log('has send', test.has('send'));
			console.log('has asdf', test.has('asdf'));

			test.on('send', callback1);
			test.on('send', callback3);
			test.on('send', callback2);
			test.send(6);

			test.send(7);

			// expect(parts.fragment).toEqual('fragment');
		});
	});
});