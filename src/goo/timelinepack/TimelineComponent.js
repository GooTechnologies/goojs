define([
	'goo/entities/components/Component'
], function (
	Component
) {
	'use strict';

	/**
	 * Timeline component
	 * @example-link http://code.gooengine.com/latest/visual-test/goo/timelinepack/TimelineComponent/TimelineComponent-vtest.html Working example
	 */
	function TimelineComponent() {
		Component.apply(this, arguments);

		this.type = 'TimelineComponent';

		this.channels = [];

		this.time = 0;
		this.duration = 0;
		this.loop = false;

		this.playing = true;
	}

	TimelineComponent.prototype = Object.create(Component.prototype);
	TimelineComponent.prototype.constructor = TimelineComponent;

	/**
	 * Adds a channel
	 * @param {Channel} channel
	 * @returns {TimelineComponent} Returns self to allow chaining
	 */
	TimelineComponent.prototype.addChannel = function (channel) {
		this.channels.push(channel);
		return this;
	};

	/**
	 * Updates all channels with the time per last frame
	 * @param {number} tpf
	 */
	TimelineComponent.prototype.update = function (tpf) {
		if (!this.playing) {
			return;
		}

		var time = this.time + tpf;
		if (time > this.duration) {
			if (this.loop) {
				time %= this.duration;
			} else {
				time = this.duration;
			}
		}
		if (time === this.time) { return this; }
		this.time = time;

		for (var i = 0; i < this.channels.length; i++) {
			var channel = this.channels[i];

			channel.update(this.time);
		}
	};

	/**
	 * Resumes updating the entities
	 */
	TimelineComponent.prototype.start = function () {
		this.playing = true;
	};

	/**
	 * Resumes updating the entities; an alias for `.play`
	 */
	TimelineComponent.prototype.resume = TimelineComponent.prototype.start;

	/**
	 * Stops updating the entities
	 */
	TimelineComponent.prototype.pause = function () {
		this.playing = false;
	};


	/**
	 * Stop updating entities and resets the state machines to their initial state
	 */
	TimelineComponent.prototype.stop = function () {
		this.playing = false;
		this.setTime(0);
	};

	/**
	 * Sets the time on all channels
	 * @param {number} time
	 */
	TimelineComponent.prototype.setTime = function (time) {
		this.time = time;

		for (var i = 0; i < this.channels.length; i++) {
			var channel = this.channels[i];

			channel.setTime(this.time);
		}

		return this;
	};

	/**
	 * Retrieves the values of all channels
	 * @private
	 * @returns {Object}
	 */
	TimelineComponent.prototype.getValues = function () {
		var retVal = {};

		for (var i = 0; i < this.channels.length; i++) {
			var channel = this.channels[i];
			if (typeof channel.value !== 'undefined' && channel.keyframes.length) {
				retVal[channel.id] = channel.value;
			}
		}

		return retVal;
	};

	return TimelineComponent;
});