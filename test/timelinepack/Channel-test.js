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

		describe('addEntry', function () {
			it('can insert an entry in a 0 entry channel', function () {
				channel.addEntry(10);

				expect(channel.entries.length).toEqual(1);
				expect(channel.entries[0].start).toEqual(10);
			});

			it('can insert an entry before any other entry', function () {
				// setup
				channel.addEntry(100);
				channel.addEntry(200);
				channel.addEntry(300);
				channel.addEntry(400);

				// inserting an entry before any existing entries
				channel.addEntry(10);

				expect(channel.entries.length).toEqual(5);
				expect(channel.entries[0].start).toEqual(10);
			});

			it('can insert an entry after any other entry', function () {
				// setup
				channel.addEntry(100);
				channel.addEntry(200);
				channel.addEntry(300);
				channel.addEntry(400);

				// inserting an entry before any existing entries
				channel.addEntry(500);

				expect(channel.entries.length).toEqual(5);
				expect(channel.entries[4].start).toEqual(500);
			});

			it('can insert an entry and maintain the set of entries sorted', function () {
				// setup
				channel.addEntry(100);
				channel.addEntry(200);
				channel.addEntry(300);
				channel.addEntry(400);

				// inserting an entry before any existing entries
				channel.addEntry(250);

				expect(channel.entries.length).toEqual(5);
				expect(channel.entries[2].start).toEqual(250);
			});
		});
	});
});