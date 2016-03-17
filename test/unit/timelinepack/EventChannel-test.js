var EventChannel = require('src/goo/timelinepack/EventChannel');

	describe('EventChannel', function () {
		var channel;
		beforeEach(function () {
			channel = new EventChannel();
		});

		describe('addCallback', function () {
			it('can insert an entry in a 0 entry channel', function () {
				channel.addCallback('id', 10);

				expect(channel.keyframes.length).toBe(1);
				expect(channel.keyframes[0].time).toBe(10);
			});

			it('can insert an entry before any other entry', function () {
				// setup
				channel.addCallback('id1', 100)
					.addCallback('id2', 200)
					.addCallback('id3', 300)
					.addCallback('id4', 400);

				// inserting an entry before any existing entries
				channel.addCallback('id5', 10);

				expect(channel.keyframes.length).toEqual(5);
				expect(channel.keyframes[0].time).toEqual(10);
			});

			it('can insert an entry after any other entry', function () {
				// setup
				channel.addCallback('id1', 100)
					.addCallback('id2', 200)
					.addCallback('id3', 300)
					.addCallback('id4', 400);

				// inserting an entry before any existing entries
				channel.addCallback('id5', 500);

				expect(channel.keyframes.length).toEqual(5);
				expect(channel.keyframes[4].time).toEqual(500);
			});

			it('can insert an entry and maintain the set of entries sorted', function () {
				// setup
				channel.addCallback('', 100)
					.addCallback('', 200)
					.addCallback('', 300)
					.addCallback('', 400);

				// inserting an entry before any existing entries
				channel.addCallback('', 250);

				expect(channel.keyframes.length).toEqual(5);
				expect(channel.keyframes[2].time).toEqual(250);
			});
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

				channel.addCallback('id0', 1, function () { data0 += 123; })
					.addCallback('id1', 2, function () { data1 += 234; });

				channel.setTime(0)
					.update(3);

				expect(data0).toEqual(123);
				expect(data1).toEqual(234);
			});

			it('will only trigger events scheduled between last position and new position', function () {
				var data0 = 0;
				var data1 = 0;
				var data2 = 0;
				var data3 = 0;

				channel.addCallback('id0', 1, function () { data0 += 123; })
					.addCallback('id1', 2, function () { data1 += 234; })
					.addCallback('id2', 3, function () { data2 += 345; })
					.addCallback('id3', 4, function () { data3 += 456; });

				channel.setTime(1.5)
					.update(3.5);

				expect(data0).toEqual(0);
				expect(data1).toEqual(234);
				expect(data2).toEqual(345);
				expect(data3).toEqual(0);
			});

			it('will trigger all events as it loops', function () {
				var data0 = 0;
				var data1 = 0;

				channel.addCallback('id0', 1, function () { data0 += 123; })
					.addCallback('id1', 4, function () { data1 += 234; });

				channel.setTime(3)
					.update(2);

				expect(data0).toEqual(123);
				expect(data1).toEqual(234);
			});

			it('will trigger only events starting from the last position and until the current position as it loops', function () {
				var data0 = 0;
				var data1 = 0;
				var data2 = 0;
				var data3 = 0;

				channel.addCallback('id0', 1, function () { data0 += 123; })
					.addCallback('id1', 2, function () { data1 += 234; })
					.addCallback('id2', 3, function () { data2 += 345; })
					.addCallback('id3', 4, function () { data3 += 456; });

				channel.setTime(3.5)
					.update(1.5);

				expect(data0).toEqual(123);
				expect(data1).toEqual(0);
				expect(data2).toEqual(0);
				expect(data3).toEqual(456);
			});

			it('will not do anything but return itself when called on a disabled channel', function () {
				channel.enabled = false;

				var data0 = 0;
				channel.addCallback('id0', 1, function () { data0 += 123; });

				expect(channel.update(1.5)).toBe(channel);
				expect(data0).toEqual(0);
			});

			it('will not do anything but return itself when called on an empty channel', function () {
				expect(channel.update(1.5)).toBe(channel);
			});
		});

		describe('setTime', function () {
			it('will not do anything but return itself when called on a disabled channel', function () {
				channel.enabled = false;
				channel.addCallback('id0', 1, function () {});
				expect(channel.setTime(1.5)).toBe(channel);
			});

			it('will not do anything but return itself when called on an empty channel', function () {
				expect(channel.setTime(1.5)).toBe(channel);
			});
		});

		describe('sort', function () {
			it('sorts the keyframes', function () {
				channel.addCallback('id0', 1, function () {})
					.addCallback('id1', 2, function () {})
					.addCallback('id2', 3, function () {})
					.addCallback('id3', 4, function () {});

				channel.keyframes[0].time = 5;
				channel.keyframes[2].time = 0;
				channel.sort();

				expect(channel.keyframes.length).toEqual(4);
				expect(channel.keyframes.every(function (keyframe, index) {
					return keyframe.time <= channel.keyframes[Math.min(channel.keyframes.length - 1, index)].time;
				})).toBeTruthy();
			});
		});
	});