define([
	'goo/timelinepack/Channel'
], function (
	Channel
	) {
	'use strict';

	describe('Channel', function() {
		var channel;
		beforeEach(function () {
			channel = new Channel();
		});

		describe('addKeyframe', function () {
			it('can insert an entry in a 0 entry channel', function () {
				channel.addKeyframe(10);

				expect(channel.keyframes.length).toEqual(1);
				expect(channel.keyframes[0].time).toEqual(10);
			});

			it('can insert an entry before any other entry', function () {
				// setup
				channel.addKeyframe(100);
				channel.addKeyframe(200);
				channel.addKeyframe(300);
				channel.addKeyframe(400);

				// inserting an entry before any existing entries
				channel.addKeyframe(10);

				expect(channel.keyframes.length).toEqual(5);
				expect(channel.keyframes[0].time).toEqual(10);
			});

			it('can insert an entry after any other entry', function () {
				// setup
				channel.addKeyframe(100);
				channel.addKeyframe(200);
				channel.addKeyframe(300);
				channel.addKeyframe(400);

				// inserting an entry before any existing entries
				channel.addKeyframe(500);

				expect(channel.keyframes.length).toEqual(5);
				expect(channel.keyframes[4].time).toEqual(500);
			});

			it('can insert an entry and maintain the set of entries sorted', function () {
				// setup
				channel.addKeyframe(100);
				channel.addKeyframe(200);
				channel.addKeyframe(300);
				channel.addKeyframe(400);

				// inserting an entry before any existing entries
				channel.addKeyframe(250);

				expect(channel.keyframes.length).toEqual(5);
				expect(channel.keyframes[2].time).toEqual(250);
			});
		});
	});
});