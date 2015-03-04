define([
	"goo/util/EventBus"
], function(
	EventBus
) {
	"use strict";

	function Test() {
	}
	EventBus.attach(Test.prototype);

	describe("EventBus", function() {
		var test;
		var listener = function (/*data, source, name*/) { };
		var listener2 = function (/*data, source, name*/) { };

		beforeEach(function () {
			test = new Test();
		});

		it('Can get EventBus methods attached', function () {
			expect(test.fire).toBeDefined();
			expect(test.on).toBeDefined();
			expect(test.off).toBeDefined();
			expect(test.has).toBeDefined();
		});

		it('Can add/remove listeners', function () {
			expect(test.has('send')).toEqual(false);
			test.on('send', listener);
			expect(test.has('send')).toEqual(true);
			expect(test.has('asdf')).toEqual(false);

			test.on('send', listener2);
			test.on('fish', listener);
			expect(test._listenerMap.get('send').size).toEqual(2);
			expect(test._listenerMap.get('fish').size).toEqual(1);

			test.off('send', listener);
			expect(test._listenerMap.get('send').size).toEqual(1);
			expect(test.has('send')).toEqual(true);

			test.off('send', listener2);
			expect(test.has('send')).toEqual(false);
		});

		it('Can listen to events', function () {
			var obj = { listener: listener };
			spyOn(obj, 'listener');

			test.on('send', obj.listener);

 			expect(obj.listener).not.toHaveBeenCalled();

			test.fire('send');
 			expect(obj.listener).toHaveBeenCalledWith(undefined, test, 'send');

			test.fire('send', 1);
 			expect(obj.listener).toHaveBeenCalledWith(1, test, 'send');

 			var data = { test: 'test' };
			test.fire('send', data);
 			expect(obj.listener).toHaveBeenCalledWith(data, test, 'send');
		});

		it('Listener can remove itself during call', function () {
			var counter = 0;

			var listenerStart = function () {
				counter++;
			};
			var listenerRemove = function (data, source, name) {
				counter++;
				source.off(name, listenerRemove);
			};
			var listenerEnd = function () {
				counter++;
			};

			test.on('send', listenerStart);
			test.on('send', listenerRemove);
			test.on('send', listenerEnd);

			test.fire('send');

 			expect(counter).toEqual(3);
			expect(test._listenerMap.get('send').size).toEqual(2);

			counter = 0;

			test.fire('send');

 			expect(counter).toEqual(2);
			expect(test._listenerMap.get('send').size).toEqual(2);
		});

		it('Listener can add new listeners during call', function () {
			var counter = 0;

			var listenerStart = function () {
				counter++;
			};
			var listenerAdd = function () {
				counter++;
			};
			var listenerEnd = function (data, source, name) {
				counter++;
				source.on(name, listenerAdd);
			};

			test.on('send', listenerStart);
			test.on('send', listenerEnd);

			test.fire('send');

 			expect(counter).toEqual(3);
			expect(test._listenerMap.get('send').size).toEqual(3);
		});
	});
});