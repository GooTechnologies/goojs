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
			var gotData;
			bus.addListener('main', function (data) { gotData = data; });
			bus.emit('main', 123);

			expect(gotData).toBe(123);
		});

		it('can add multiple listeners to same channel', function () {
			var gotData1, gotData2;
			bus.addListener('main', function (data) { gotData1 = data; });
			bus.addListener('main', function (data) { gotData2 = data; });
			bus.emit('main', 123);

			expect(gotData1).toBe(123);
			expect(gotData2).toBe(123);
		});

		it('cannot add the same listener to a channel', function () {
			var gotData;

			var channel = 'main';
			var listener = function (data) { gotData = data; };
			bus.addListener(channel, listener);
			bus.addListener(channel, listener);

			expect(bus.trie.children.get(channel).listeners.length).toBe(1);
		});

		it('can send to multiple channels', function () {
			var gotData1, gotData2, gotData3;
			bus.addListener('first', function (data) { gotData1 = data; });
			bus.addListener('second', function (data) { gotData2 = data; });
			bus.addListener('third', function (data) { gotData3 = data; });
			bus.emit(['first', 'third'], 123);

			expect(gotData1).toBe(123);
			expect(gotData2).toBeUndefined();
			expect(gotData3).toBe(123);
		});

		it('can send to superchannels', function () {
			var gotData1, gotData2, gotData3;
			bus.addListener('main.first', function (data) { gotData1 = data; });
			bus.addListener('main', function (data) { gotData2 = data; });
			bus.addListener('second', function (data) { gotData3 = data; });
			bus.emit('main', 123);

			expect(gotData1).toBe(123);
			expect(gotData2).toBe(123);
			expect(gotData3).toBeUndefined();
		});

		it('can send to subchannels', function () {
			var gotData1, gotData2, gotData3;
			bus.addListener('main.first.second', function (data) { gotData1 = data; });
			bus.addListener('main.first', function (data) { gotData2 = data; });
			bus.addListener('third', function (data) { gotData3 = data; });
			bus.emit('main.first.second', 123);

			expect(gotData1).toBe(123);
			expect(gotData2).toBeUndefined();
			expect(gotData3).toBeUndefined();
		});

		it('can remove a listener from a channel', function () {
			var gotData1, gotData2, gotData3;
			bus.addListener('first', function (data) { gotData1 = data; });

			var secondListener = function (data) { gotData2 = data; };
			bus.addListener('second', secondListener);

			bus.addListener('third', function (data) { gotData3 = data; });
			bus.removeListener('second', secondListener);

			bus.emit('first', 123);
			bus.emit('second', 321);

			expect(gotData1).toBe(123);
			expect(gotData2).toBeUndefined();
			expect(gotData3).toBeUndefined();
		});

		it('can remove a listener from a channel only', function () {
			var gotData1, gotData2, gotData3, gotData4;
			bus.addListener('first', function (data) { gotData1 = data; });

			var secondListener = function (data) { gotData2 = data; };
			bus.addListener('first.second', secondListener);

			bus.addListener('first.second.third', function (data) { gotData3 = data; });
			bus.addListener('fourth', function (data) { gotData4 = data; });

			bus.removeListener('first.second', secondListener);

			bus.emit('first', 123);
			bus.emit('first.second', 234);
			bus.emit('first.second.third', 345);
			bus.emit('fourth', 456);

			expect(gotData1).toBe(123);
			expect(gotData2).toBeUndefined();
			expect(gotData3).toBe(345);
			expect(gotData4).toBe(456);
		});

		it('can remove all listeners from a channel', function () {
			var gotData1, gotData2, gotData3;

			bus.addListener('first', function (data) { gotData1 = data; });
			bus.addListener('first', function (data) { gotData2 = data; });
			bus.addListener('second', function (data) { gotData3 = data; });
			bus.removeAllOnChannel('first');

			bus.emit('first', 123);
			bus.emit('second', 321);

			expect(gotData1).toBeUndefined();
			expect(gotData2).toBeUndefined();
			expect(gotData3).toBe(321);
		});

		it('can remove all listeners from a channel only', function () {
			var gotData1, gotData2, gotData3, gotData4, gotData5;

			bus.addListener('first', function (data) { gotData1 = data; });
			bus.addListener('first.second', function (data) { gotData2 = data; });
			bus.addListener('first.second', function (data) { gotData3 = data; });
			bus.addListener('first.second.third', function (data) { gotData4 = data; });
			bus.addListener('fourth', function (data) { gotData5 = data; });

			bus.removeAllOnChannel('first.second');

			bus.emit('first', 123);
			bus.emit('first.second', 234);
			bus.emit('first.second.third', 345);
			bus.emit('fourth', 456);

			expect(gotData1).toBe(123);
			expect(gotData2).toBeUndefined();
			expect(gotData3).toBeUndefined();
			expect(gotData4).toBe(345);
			expect(gotData5).toBe(456);
		});

		it('can remove a listener from all channels', function () {
			var gotData1, gotData2;
			var listener = function (data) { gotData1 = data; };

			bus.addListener('first', listener);
			bus.addListener('second', listener);
			bus.addListener('third', function (data) { gotData2 = data; });
			bus.removeListenerFromAllChannels(listener);

			bus.emit('first', 123);
			bus.emit('third', 321);

			expect(gotData1).toBeUndefined();
			expect(gotData2).toBe(321);
		});

		describe('removeChannelAndChildren', function () {
			it('can remove a channel and its children', function () {
				var gotData1, gotData2, gotData3, gotData4, gotData5;

				bus.addListener('first', function (data) { gotData1 = data; });
				bus.addListener('first.second', function (data) { gotData2 = data; });
				bus.addListener('first.second', function (data) { gotData3 = data; });
				bus.addListener('first.second.third', function (data) { gotData4 = data; });
				bus.addListener('fourth', function (data) { gotData5 = data; });

				bus.removeChannelAndChildren('first.second');

				bus.emit('first', 123);
				bus.emit('first.second', 234);
				bus.emit('first.second.third', 345);
				bus.emit('fourth', 456);

				expect(gotData1).toBe(123);
				expect(gotData2).toBeUndefined();
				expect(gotData3).toBeUndefined();
				expect(gotData4).toBeUndefined();
				expect(gotData5).toBe(456);
			});

			it('removes the channel even if it\'s a top level channel', function () {
				var gotData1, gotData2;

				bus.addListener('first', function (data) { gotData1 = data; });
				bus.addListener('first.second', function (data) { gotData2 = data; });

				bus.removeChannelAndChildren('first');

				bus.emit('first', 123);
				bus.emit('first.second', 234);

				expect(gotData1).toBeUndefined();
				expect(gotData2).toBeUndefined();
			});
		});

		describe('emit', function () {
			it('does not store the last message by default', function () {
				bus.emit('main', 123);

				var gotData;
				bus.addListener('main', function (data) { gotData = data; });

				expect(gotData).toBeUndefined();
			});

			it('stores the last message when told to', function () {
				bus.emit('main', 123, true);

				var gotData;
				bus.addListener('main', function (data) { gotData = data; }, true);

				expect(gotData).toBe(123);
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

				var gotData;
				bus.addListener('main', function (data) { gotData = data; });

				expect(gotData).toBeUndefined();
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
