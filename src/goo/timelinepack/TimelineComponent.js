define([
	'goo/entities/components/Component'
], function (
	Component
	) {
	'use strict';

	function TimelineComponent() {
		this.type = 'TimelineComponent';

		this.channels = [];

		this.time = 0;
		this.duration = 0;
		this.loop = false;
	}

	TimelineComponent.prototype = Object.create(Component.prototype);
	TimelineComponent.prototype.constructor = TimelineComponent;

	/**
	 * Adds a channel
	 * @param {Channel} channel
	 */
	TimelineComponent.prototype.addChannel = function (channel) {
		this.channels.push(channel);
	};

	/**
	 * Updates all channels with the time per last frame
	 * @param {number} tpf
	 */
	TimelineComponent.prototype.update = function (tpf) {
		var time = this.time + tpf;
		if (time > this.duration) {
			if (this.loop) {
				time = time % this.duration;
			} else {
				time = this.duration;
			}
		} else if (time < 0) {
			this.time = 0;
		}
		if (time === this.time) { return; }
		this.time = time;

		for (var i = 0; i < this.channels.length; i++) {
			var channel = this.channels[i];

			channel.update(this.time);
		}
	};

	/**
	 * Sets the time on all channels
	 * @param {number} time
	 * @returns {object} The new channel values
	 */
	TimelineComponent.prototype.setTime = function (time) {
		var retVal = {};
		this.time = time;

		for (var i = 0; i < this.channels.length; i++) {
			var channel = this.channels[i];

			retVal[channel.id] = channel.setTime(this.time);
		}
		return retVal;
	};

	return TimelineComponent;
});