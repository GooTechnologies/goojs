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
				channel.addEntry(10, 20);

				expect(channel.entries.length).toEqual(1);
				expect(channel.entries[0].start).toEqual(10);
				expect(channel.entries[0].length).toEqual(20);
			});

			it('can insert an entry before any other entry', function () {
				// setup
				channel.addEntry(100, 20);
				channel.addEntry(200, 20);
				channel.addEntry(300, 20);
				channel.addEntry(400, 20);

				// inserting an entry before any existing entries
				channel.addEntry(10, 20);

				expect(channel.entries.length).toEqual(5);
				expect(channel.entries[0].start).toEqual(10);
				expect(channel.entries[0].length).toEqual(20);
			});

			it('can insert an entry after any other entry', function () {
				// setup
				channel.addEntry(100, 10);
				channel.addEntry(200, 20);
				channel.addEntry(300, 30);
				channel.addEntry(400, 40);

				// inserting an entry before any existing entries
				channel.addEntry(500, 50);

				expect(channel.entries.length).toEqual(5);
				expect(channel.entries[4].start).toEqual(500);
				expect(channel.entries[4].length).toEqual(50);
			});

			it('can insert an entry and maintain the set of entries sorted', function () {
				// setup
				channel.addEntry(100, 10);
				channel.addEntry(200, 20);
				channel.addEntry(300, 30);
				channel.addEntry(400, 40);

				// inserting an entry before any existing entries
				channel.addEntry(250, 50);

				expect(channel.entries.length).toEqual(5);
				expect(channel.entries[2].start).toEqual(250);
				expect(channel.entries[2].length).toEqual(50);
			});
		});


	});
});