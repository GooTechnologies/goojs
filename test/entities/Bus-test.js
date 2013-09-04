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
	});
});
