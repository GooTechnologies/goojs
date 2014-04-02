define([
	'goo/entities/components/Component'
], function (
	Component
	) {
	'use strict';

	function TimelineComponent() {
		//! AT: pass this as a parameter to the base Component class
		this.type = 'TimelineComponent';

		this.channels = [];

		this.time = 0;
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
		this.time += tpf;

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

			retVal[channel.id] = channel.update(this.time);
		}
		return retVal;
	};

	return TimelineComponent;
});