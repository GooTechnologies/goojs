define([
	'goo/timelinepack/EventChannel'
], function (
	EventChannel
	) {
	'use strict';

	describe('EventChannel', function () {
		var channel;
		beforeEach(function () {
			channel = new EventChannel();
		});

		describe('update', function () {
			it('will not trigger an event that is scheduled at position 0 when jumping form position 0 to 0', function () {
				var data = 0;
				channel.addCallback('id', 0, function () { data += 123; });
				channel.update(0);

				expect(data).toEqual(0);
			});

			it('will trigger an event that is scheduled at position 0 when jumping form position 0 to 1', function () {
				var data = 0;
				channel.addCallback('id', 0, function () { data += 123; });
				channel.update(1);

				expect(data).toEqual(123);
			});

			it('will trigger all events scheduled between last position and new position', function () {
				var data0 = 0;
				var data1 = 0;

				channel.addCallback('id0', 1, function () { data0 += 123; });
				channel.addCallback('id1', 2, function () { data1 += 234; });

				channel.update(3);

				expect(data0).toEqual(123);
				expect(data1).toEqual(234);
			});

			it('will only trigger events scheduled between last position and new position', function () {
				var data0 = 0;
				var data1 = 0;
				var data2 = 0;
				var data3 = 0;

				channel.addCallback('id0', 1, function () { data0 += 123; });
				channel.addCallback('id1', 2, function () { data1 += 234; });
				channel.addCallback('id2', 3, function () { data2 += 345; });
				channel.addCallback('id3', 4, function () { data3 += 456; });

				channel.setTime(1.5);
				channel.update(3.5);

				expect(data0).toEqual(0);
				expect(data1).toEqual(234);
				expect(data2).toEqual(345);
				expect(data3).toEqual(0);
			});

			it('will trigger all events as it loops', function () {
				var data0 = 0;
				var data1 = 0;

				channel.addCallback('id0', 1, function () { data0 += 123; });
				channel.addCallback('id1', 4, function () { data1 += 234; });

				channel.setTime(3);
				channel.update(2);

				expect(data0).toEqual(123);
				expect(data1).toEqual(234);
			});

			it('will trigger only events starting from the last position and until the current position as it loops', function () {
				var data0 = 0;
				var data1 = 0;
				var data2 = 0;
				var data3 = 0;

				channel.addCallback('id0', 1, function () { data0 += 123; });
				channel.addCallback('id1', 2, function () { data1 += 234; });
				channel.addCallback('id2', 3, function () { data2 += 345; });
				channel.addCallback('id3', 4, function () { data3 += 456; });

				channel.setTime(3.5);
				channel.update(1.5);

				expect(data0).toEqual(123);
				expect(data1).toEqual(0);
				expect(data2).toEqual(0);
				expect(data3).toEqual(456);
			});
		});
	});
});