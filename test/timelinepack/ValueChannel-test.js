define([
	'goo/timelinepack/ValueChannel'
], function (
	ValueChannel
	) {
	'use strict';

	describe('ValueChannel', function() {
		var channel;
		beforeEach(function () {
			channel = new ValueChannel();
		});

		describe('addKeyframe', function () {
			it('can insert an entry in a 0 entry channel', function () {
				channel.addKeyframe('', 10);

				expect(channel.keyframes.length).toEqual(1);
				expect(channel.keyframes[0].time).toEqual(10);
			});

			it('can insert an entry before any other entry', function () {
				// setup
				channel.addKeyframe('', 100)
					.addKeyframe('', 200)
					.addKeyframe('', 300)
					.addKeyframe('', 400);

				// inserting an entry before any existing entries
				channel.addKeyframe('', 10);

				expect(channel.keyframes.length).toEqual(5);
				expect(channel.keyframes[0].time).toEqual(10);
			});

			it('can insert an entry after any other entry', function () {
				// setup
				channel.addKeyframe('', 100)
					.addKeyframe('', 200)
					.addKeyframe('', 300)
					.addKeyframe('', 400);

				// inserting an entry before any existing entries
				channel.addKeyframe('', 500);

				expect(channel.keyframes.length).toEqual(5);
				expect(channel.keyframes[4].time).toEqual(500);
			});

			it('can insert an entry and maintain the set of entries sorted', function () {
				// setup
				channel.addKeyframe('', 100)
					.addKeyframe('', 200)
					.addKeyframe('', 300)
					.addKeyframe('', 400);

				// inserting an entry before any existing entries
				channel.addKeyframe('', 250);

				expect(channel.keyframes.length).toEqual(5);
				expect(channel.keyframes[2].time).toEqual(250);
			});
		});

		describe('update', function () {
			it('calls the update callback with the correct value', function () {
				var data0 = 0;
				channel.callbackUpdate = function (data) { data0 = data; };

				channel.addKeyframe('', 100, 1, function (progress) { return progress; })
					.addKeyframe('', 200, 2, function () {});

				channel.update(150);
			});
		});
	});
});