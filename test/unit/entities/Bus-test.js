define([
	'goo/entities/Bus'
], function (
	Bus
) {
	'use strict';

	describe('Bus', function () {
		var bus;

		beforeEach(function () {
			bus = new Bus();
		});

		it('can add a listener, emit and capture a message', function () {
			var listener = jasmine.createSpy('listener');

			bus.addListener('main', listener);
			bus.emit('main', 123);

			expect(listener).toHaveBeenCalledWith(123, 'main', bus);
		});

		it('can add multiple listeners to same channel', function () {
			var listener1 = jasmine.createSpy('listener1');
			var listener2 = jasmine.createSpy('listener2');

			bus.addListener('main', listener1);
			bus.addListener('main', listener2);
			bus.emit('main', 123);

			expect(listener1).toHaveBeenCalledWith(123, 'main', bus);
			expect(listener2).toHaveBeenCalledWith(123, 'main', bus);
		});

		it('cannot add the same listener to a channel', function () {
			var channel = 'main';
			var listener = jasmine.createSpy('listener');

			bus.addListener(channel, listener);
			bus.addListener(channel, listener);

			expect(bus.trie.children.get(channel).listeners.length).toBe(1);
		});

		it('can send to multiple channels', function () {
			var listener1 = jasmine.createSpy('listener1');
			var listener2 = jasmine.createSpy('listener2');
			var listener3 = jasmine.createSpy('listener3');

			bus.addListener('first', listener1);
			bus.addListener('second', listener2);
			bus.addListener('third', listener3);
			bus.emit(['first', 'third'], 123);

			expect(listener1).toHaveBeenCalledWith(123, 'first', bus);
			expect(listener2).not.toHaveBeenCalled();
			expect(listener3).toHaveBeenCalledWith(123, 'third', bus);
		});

		it('can send to superchannels', function () {
			var listener1 = jasmine.createSpy('listener1');
			var listener2 = jasmine.createSpy('listener2');
			var listener3 = jasmine.createSpy('listener3');

			bus.addListener('main.first', listener1);
			bus.addListener('main', listener2);
			bus.addListener('second', listener3);
			bus.emit('main', 123);

			expect(listener1).toHaveBeenCalledWith(123, 'main', bus);
			expect(listener2).toHaveBeenCalledWith(123, 'main', bus);
			expect(listener3).not.toHaveBeenCalled();
		});

		it('can send to subchannels', function () {
			var listener1 = jasmine.createSpy('listener1');
			var listener2 = jasmine.createSpy('listener2');
			var listener3 = jasmine.createSpy('listener3');

			bus.addListener('main.first.second', listener1);
			bus.addListener('main.first', listener2);
			bus.addListener('third', listener3);
			bus.emit('main.first.second', 123);

			expect(listener1).toHaveBeenCalledWith(123, 'main.first.second', bus);
			expect(listener2).not.toHaveBeenCalled();
			expect(listener3).not.toHaveBeenCalled();
		});

		it('can remove a listener from a channel', function () {
			var listener1 = jasmine.createSpy('listener1');
			var listener2 = jasmine.createSpy('listener2');
			var listener3 = jasmine.createSpy('listener3');

			bus.addListener('first', listener1);
			bus.addListener('second', listener2);
			bus.addListener('third', listener3);

			bus.removeListener('second', listener2);

			bus.emit('first', 123);
			bus.emit('second', 321);

			expect(listener1).toHaveBeenCalledWith(123, 'first', bus);
			expect(listener2).not.toHaveBeenCalled();
			expect(listener3).not.toHaveBeenCalled();
		});

		it('can remove a listener from a channel only', function () {
			var listener1 = jasmine.createSpy('listener1');
			var listener2 = jasmine.createSpy('listener2');
			var listener3 = jasmine.createSpy('listener3');
			var listener4 = jasmine.createSpy('listener4');

			bus.addListener('first', listener1);
			bus.addListener('first.second', listener2);
			bus.addListener('first.second.third', listener3);
			bus.addListener('fourth', listener4);

			bus.removeListener('first.second', listener2);

			bus.emit('first', 123);
			bus.emit('first.second', 234);
			bus.emit('first.second.third', 345);
			bus.emit('fourth', 456);

			expect(listener1).toHaveBeenCalledWith(123, 'first', bus);
			expect(listener2).not.toHaveBeenCalled();
			expect(listener3).toHaveBeenCalledWith(345, 'first.second.third', bus);
			expect(listener4).toHaveBeenCalledWith(456, 'fourth', bus);
		});

		it('can remove all listeners from a channel', function () {
			var listener1 = jasmine.createSpy('listener1');
			var listener2 = jasmine.createSpy('listener2');
			var listener3 = jasmine.createSpy('listener3');

			bus.addListener('first', listener1);
			bus.addListener('first', listener2);
			bus.addListener('second', listener3);

			bus.removeAllOnChannel('first');

			bus.emit('first', 123);
			bus.emit('second', 321);

			expect(listener1).not.toHaveBeenCalled();
			expect(listener2).not.toHaveBeenCalled();
			expect(listener3).toHaveBeenCalledWith(321, 'second', bus);
		});

		it('can remove all listeners from a channel only', function () {
			var listener1 = jasmine.createSpy('listener1');
			var listener2 = jasmine.createSpy('listener2');
			var listener3 = jasmine.createSpy('listener3');
			var listener4 = jasmine.createSpy('listener4');
			var listener5 = jasmine.createSpy('listener5');

			bus.addListener('first', listener1);
			bus.addListener('first.second', listener2);
			bus.addListener('first.second', listener3);
			bus.addListener('first.second.third', listener4);
			bus.addListener('fourth', listener5);

			bus.removeAllOnChannel('first.second');

			bus.emit('first', 123);
			bus.emit('first.second', 234);
			bus.emit('first.second.third', 345);
			bus.emit('fourth', 456);

			expect(listener1).toHaveBeenCalledWith(123, 'first', bus);
			expect(listener2).not.toHaveBeenCalled();
			expect(listener3).not.toHaveBeenCalled();
			expect(listener4).toHaveBeenCalledWith(345, 'first.second.third', bus);
			expect(listener5).toHaveBeenCalledWith(456, 'fourth', bus);
		});

		it('can remove a listener from all channels', function () {
			var listener1 = jasmine.createSpy('listener1');
			var listener2 = jasmine.createSpy('listener2');

			bus.addListener('first', listener1);
			bus.addListener('second', listener1);
			bus.addListener('third', listener2);

			bus.removeListenerFromAllChannels(listener1);

			bus.emit('first', 123);
			bus.emit('third', 321);

			expect(listener1).not.toHaveBeenCalled();
			expect(listener2).toHaveBeenCalledWith(321, 'third', bus);
		});

		describe('removeChannelAndChildren', function () {
			it('can remove a channel and its children', function () {
				var listener1 = jasmine.createSpy('listener1');
				var listener2 = jasmine.createSpy('listener2');
				var listener3 = jasmine.createSpy('listener3');
				var listener4 = jasmine.createSpy('listener4');
				var listener5 = jasmine.createSpy('listener5');

				bus.addListener('first', listener1);
				bus.addListener('first.second', listener2);
				bus.addListener('first.second', listener3);
				bus.addListener('first.second.third', listener4);
				bus.addListener('fourth', listener5);

				bus.removeChannelAndChildren('first.second');

				bus.emit('first', 123);
				bus.emit('first.second', 234);
				bus.emit('first.second.third', 345);
				bus.emit('fourth', 456);

				expect(listener1).toHaveBeenCalledWith(123, 'first', bus);
				expect(listener2).not.toHaveBeenCalled();
				expect(listener3).not.toHaveBeenCalled();
				expect(listener4).not.toHaveBeenCalled();
				expect(listener5).toHaveBeenCalledWith(456, 'fourth', bus);
			});

			it('removes the channel even if it\'s a top level channel', function () {
				var listener1 = jasmine.createSpy('listener1');
				var listener2 = jasmine.createSpy('listener2');

				bus.addListener('first', listener1);
				bus.addListener('first.second', listener2);

				bus.removeChannelAndChildren('first');

				bus.emit('first', 123);
				bus.emit('first.second', 234);

				expect(listener1).not.toHaveBeenCalled();
				expect(listener2).not.toHaveBeenCalled();
			});
		});

		describe('emit', function () {
			it('does not store the last message by default', function () {
				bus.emit('main', 123);

				var listener = jasmine.createSpy('listener');
				bus.addListener('main', listener);

				expect(listener).not.toHaveBeenCalled();
			});

			it('stores the last message when told to', function () {
				bus.emit('main', 123, true);

				var listener = jasmine.createSpy('listener');
				bus.addListener('main', listener, true);

				expect(listener).toHaveBeenCalledWith(123, 'main', bus);
			});

			it('returns itself', function () {
				expect(bus.emit('main')).toBe(bus);
			});

			it('correctly emits to channels as they are removed (before the current position)', function () {
				var spy1 = jasmine.createSpy('spy1');
				var rem2 = function () { bus.removeListener('main', spy1); };
				var spy3 = jasmine.createSpy('spy5');

				bus.addListener('main', spy1);
				bus.addListener('main', rem2);
				bus.addListener('main', spy3);

				bus.emit('main');

				expect(spy1).toHaveBeenCalled(); // rem2 executes after
				expect(spy3).toHaveBeenCalled();
			});

			it('correctly emits to channels as they are removed (after the current position)', function () {
				var spy1 = jasmine.createSpy('spy1');
				var rem2 = function () { bus.removeListener('main', spy3); };
				var spy3 = jasmine.createSpy('spy3');

				bus.addListener('main', spy1);
				bus.addListener('main', rem2);
				bus.addListener('main', spy3);

				bus.emit('main');

				expect(spy1).toHaveBeenCalled();
				expect(spy3).not.toHaveBeenCalled(); // rem3 executed before
			});
		});

		describe('getLastMessageOn', function () {
			it('retrieves the last message sent on a channel', function () {
				bus.emit('main', 123, true);

				expect(bus.getLastMessageOn('main')).toEqual(123);
			});

			it('retrieves the last message sent on a channel when sending multiple data', function () {
				bus.emit('main', 123, true);
				bus.emit('main', 456, true);

				expect(bus.getLastMessageOn('main')).toEqual(456);
			});

			it('retrieves nothing if there was no stored data on a channel', function () {
				bus.emit('main', 123);

				expect(bus.getLastMessageOn('main')).toBeUndefined();
			});
		});

		describe('addListener', function () {
			it('does not retrieve the last message by default', function () {
				bus.emit('main', 123, true);

				var listener = jasmine.createSpy('listener');
				bus.addListener('main', listener);

				expect(listener).not.toHaveBeenCalled();
			});

			it('returns itself', function () {
				expect(bus.addListener('main', function () {})).toBe(bus);
			});
		});

		describe('removeListener', function () {
			it('returns itself', function () {
				var listener = function () {};
				bus.addListener('main', listener);
				expect(bus.removeListener('main', listener)).toBe(bus);
			});
		});

		describe('removeAllOnChannel', function () {
			it('returns itself', function () {
				expect(bus.removeAllOnChannel('main')).toBe(bus);
			});
		});

		describe('removeChannelAndChildren', function () {
			it('returns itself', function () {
				expect(bus.removeChannelAndChildren('main')).toBe(bus);
			});
		});

		describe('removeListenerFromAllChannels', function () {
			it('returns itself', function () {
				expect(bus.removeListenerFromAllChannels('main', function () {})).toBe(bus);
			});
		});

		describe('clear', function () {
			it('clears the system bus of any channels or listeners', function () {
				bus.addListener('main', function (data) {});
				bus.addListener('main.second', function (data) {});
				bus.clear();
				var newBus = new Bus();
				bus._emitOnEachChildChannel = newBus._emitOnEachChildChannel = null; // this function is the only thing that differ in the following test
				expect(bus).toEqual(newBus);
			});
		});
	});
});
