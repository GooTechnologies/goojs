define([
	'goo/entities/Bus'
], function(
	Bus
) {
	'use strict';

	describe('Bus', function() {
		var bus;
		beforeEach(function() {
			bus = new Bus();
		});
		it('can add a listener, emit and capture a message', function() {
			var gotData;
			bus.addListener('main', function(data) { gotData = data; });
			bus.emit('main', 123);

			expect(gotData).toBe(123);
		});

		it('can add multiple listeners to same channel', function() {
			var gotData1, gotData2;
			bus.addListener('main', function(data) { gotData1 = data; });
			bus.addListener('main', function(data) { gotData2 = data; });
			bus.emit('main', 123);

			expect(gotData1).toBe(123);
			expect(gotData2).toBe(123);
		});

		it('can send to multiple channels', function() {
			var gotData1, gotData2, gotData3;
			bus.addListener('first', function(data) { gotData1 = data; });
			bus.addListener('second', function(data) { gotData2 = data; });
			bus.addListener('third', function(data) { gotData3 = data; });
			bus.emit(['first', 'third'], 123);

			expect(gotData1).toBe(123);
			expect(gotData2).toBeUndefined();
			expect(gotData3).toBe(123);
		});

		it('can send to superchannels', function() {
			var gotData1, gotData2, gotData3;
			bus.addListener('main.first', function(data) { gotData1 = data; });
			bus.addListener('main', function(data) { gotData2 = data; });
			bus.addListener('second', function(data) { gotData3 = data; });
			bus.emit('main', 123);

			expect(gotData1).toBe(123);
			expect(gotData2).toBe(123);
			expect(gotData3).toBeUndefined();
		});

		it('can send to subchannels', function() {
			var gotData1, gotData2, gotData3;
			bus.addListener('main.first.second', function(data) { gotData1 = data; });
			bus.addListener('main.first', function(data) { gotData2 = data; });
			bus.addListener('second', function(data) { gotData3 = data; });
			bus.emit('main.first.second', 123);

			expect(gotData1).toBe(123);
			expect(gotData2).toBeUndefined();
			expect(gotData3).toBeUndefined();
		});

		it('can remove a listener from a channel', function() {
			var gotData1, gotData2, gotData3;
			bus.addListener('first', function(data) { gotData1 = data; });

			var secondListener = function(data) { gotData2 = data; };
			bus.addListener('second', secondListener);

			bus.addListener('third', function(data) { gotData3 = data; });
			bus.removeListener('second', secondListener);

			bus.emit('first', 123);
			bus.emit('second', 321);

			expect(gotData1).toBe(123);
			expect(gotData2).toBeUndefined();
			expect(gotData3).toBeUndefined();
		});

		it('can remove all listeners from a channel', function() {
			var gotData1, gotData2, gotData3;

			bus.addListener('first', function(data) { gotData1 = data; });
			bus.addListener('first', function(data) { gotData2 = data; });
			bus.addListener('second', function(data) { gotData3 = data; });
			bus.removeAllOnChannel('first');

			bus.emit('first', 123);
			bus.emit('second', 321);

			expect(gotData1).toBeUndefined();
			expect(gotData2).toBeUndefined();
			expect(gotData3).toBe(321);
		});

		it('can remove a listener from all channels', function() {
			var gotData1, gotData2;
			var listener = function(data) { gotData1 = data; };

			bus.addListener('first', listener);
			bus.addListener('second', listener);
			bus.addListener('third', function(data) { gotData2 = data; });
			bus.removeListenerFromAllChannels(listener);

			bus.emit('first', 123);
			bus.emit('third', 321);

			expect(gotData1).toBeUndefined();
			expect(gotData2).toBe(321);
		});
	});
});
