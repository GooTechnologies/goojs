var TimelineComponent = require('src/goo/timelinepack/TimelineComponent');

describe('TimelineComponent', function () {
	var timelineComponent;
	beforeEach(function () {
		timelineComponent = new TimelineComponent();
		timelineComponent.duration = 1000;
	});

	function getPhonyChannel(callback, id, value) {
		return {
			update: callback,
			setTime: callback,
			id: id,
			value: value,
			keyframes: [1, 2, 3]
		};
	}

	describe('update', function () {
		it('updates all channels', function () {
			var spy0 = jasmine.createSpy('spy0');
			var spy1 = jasmine.createSpy('spy1');

			timelineComponent.addChannel(getPhonyChannel(spy0));
			timelineComponent.addChannel(getPhonyChannel(spy1));

			timelineComponent.update(123);

			expect(spy0.calls.count()).toEqual(1);
			expect(spy1.calls.count()).toEqual(1);

			expect(spy0).toHaveBeenCalledWith(123);
			expect(spy1).toHaveBeenCalledWith(123);
		});

		it('stops at the end if looping is disabled', function () {
			var spy0 = jasmine.createSpy('spy0');
			var spy1 = jasmine.createSpy('spy1');

			timelineComponent.addChannel(getPhonyChannel(spy0));
			timelineComponent.addChannel(getPhonyChannel(spy1));

			timelineComponent.update(123);
			timelineComponent.update(987);

			expect(spy0.calls.count()).toEqual(2);
			expect(spy1.calls.count()).toEqual(2);

			expect(spy0).toHaveBeenCalledWith(1000);
			expect(spy1).toHaveBeenCalledWith(1000);
		});

		it('loops over', function () {
			var spy0 = jasmine.createSpy('spy0');
			var spy1 = jasmine.createSpy('spy1');

			timelineComponent.loop = true;
			timelineComponent.addChannel(getPhonyChannel(spy0));
			timelineComponent.addChannel(getPhonyChannel(spy1));

			timelineComponent.update(123);
			timelineComponent.update(987);

			expect(spy0.calls.count()).toEqual(2);
			expect(spy1.calls.count()).toEqual(2);

			expect(spy0).toHaveBeenCalledWith((123 + 987) % 1000);
			expect(spy1).toHaveBeenCalledWith((123 + 987) % 1000);
		});

		it('does nothing if called twice with the same time', function () {
			var spy0 = jasmine.createSpy('spy0');
			var spy1 = jasmine.createSpy('spy1');

			timelineComponent.addChannel(getPhonyChannel(spy0));
			timelineComponent.addChannel(getPhonyChannel(spy1));

			timelineComponent.update(123);
			timelineComponent.update(0);

			expect(spy0.calls.count()).toEqual(1);
			expect(spy1.calls.count()).toEqual(1);
		});
	});

	describe('setTime', function () {
		it('sets the time on all channels', function () {
			var spy0 = jasmine.createSpy('spy0');
			var spy1 = jasmine.createSpy('spy1');

			timelineComponent.addChannel(getPhonyChannel(spy0));
			timelineComponent.addChannel(getPhonyChannel(spy1));

			timelineComponent.setTime(123);

			expect(spy0.calls.count()).toEqual(1);
			expect(spy1.calls.count()).toEqual(1);

			expect(spy0).toHaveBeenCalledWith(123);
			expect(spy1).toHaveBeenCalledWith(123);
		});
	});

	describe('getValues', function () {
		it('gets the time on all channels', function () {
			timelineComponent.addChannel(getPhonyChannel(null, 'id0', 123));
			timelineComponent.addChannel(getPhonyChannel(null, 'id1', 456));

			expect(timelineComponent.getValues()).toEqual({ id0: 123, id1: 456 });
		});
	});
});
