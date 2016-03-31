var EventTarget = require('../../src/goo/util/EventTarget');

function Test() {
	EventTarget.apply(this, arguments);
}
Test.prototype = Object.create(EventTarget.prototype);

describe('EventTarget', function () {
	var test;
	var listener = function (/*event*/) { };
	var listener2 = function (/*event*/) { };
	var sendEvent = {
		type: 'send',
		data: undefined
	};

	beforeEach(function () {
		test = new Test();
	});

	it('Can get EventTarget methods attached', function () {
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
		expect(test._listenerMap.get('send').length).toEqual(2);
		expect(test._listenerMap.get('fish').length).toEqual(1);

		test.off('send', listener);
		expect(test._listenerMap.get('send').length).toEqual(1);
		expect(test.has('send')).toEqual(true);

		test.off('send', listener2);
		expect(test.has('send')).toEqual(false);
	});

	it('Cannot add multiple', function () {
		expect(test._listenerMap.get('send')).toBeUndefined();
		test.on('send', listener);
		expect(test._listenerMap.get('send').length).toEqual(1);
		test.on('send', listener);
		test.on('send', listener);
		test.on('send', listener);
		expect(test._listenerMap.get('send').length).toEqual(1);

		test.off('send', listener);
		expect(test._listenerMap.get('send')).toBeUndefined();
	});

	it('Can remove all listeners of type', function () {
		test.on('send', listener);
		test.on('send', listener2);
		expect(test.has('send')).toEqual(true);
		expect(test._listenerMap.get('send').length).toEqual(2);

		test.off('send');
		expect(test.has('send')).toEqual(false);
		expect(test._listenerMap.get('send')).toBeUndefined();
	});

	it('Can listen to events', function () {
		var obj = { listener: listener };
		spyOn(obj, 'listener');

		test.on('send', obj.listener);

		expect(obj.listener).not.toHaveBeenCalled();

		test.fire(sendEvent);
		expect(obj.listener).toHaveBeenCalledWith(sendEvent);

		sendEvent.data = 1;
		test.fire('send', 1);
		expect(obj.listener).toHaveBeenCalledWith(sendEvent);

		var data = {
			type: 'send',
			test: 'test'
		};
		test.fire(data);
		expect(obj.listener).toHaveBeenCalledWith(data);
	});

	it('Listener can remove itself during call', function () {
		var counter = 0;

		var listenerStart = function () {
			counter++;
		};
		var listenerRemove = function (event) {
			counter++;
			event.target.off(event.type, listenerRemove);
		};
		var listenerEnd = function () {
			counter++;
		};

		test.on('send', listenerStart);
		test.on('send', listenerRemove);
		test.on('send', listenerEnd);

		test.fire(sendEvent);

		expect(counter).toEqual(3);
		expect(test._listenerMap.get('send').length).toEqual(2);

		counter = 0;

		test.fire(sendEvent);

		expect(counter).toEqual(2);
		expect(test._listenerMap.get('send').length).toEqual(2);
	});

	it('Listener can add new listeners during call', function () {
		var counter = 0;

		var listenerStart = function () {
			counter++;
		};
		var listenerAdd = function () {
			counter++;
		};
		var listenerEnd = function (event) {
			counter++;
			event.target.on(event.type, listenerAdd);
		};

		test.on('send', listenerStart);
		test.on('send', listenerEnd);

		test.fire(sendEvent);
		expect(counter).toEqual(2);
		expect(test._listenerMap.get('send').length).toEqual(3);

		counter = 0;

		test.fire(sendEvent);
		expect(counter).toEqual(3);
		expect(test._listenerMap.get('send').length).toEqual(3);
	});
});
