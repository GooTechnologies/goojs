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
		for (var i = 0; i < this.channels.length; i++) {
			var channel = this.channels[i];

			channel.update(tpf);
		}
	};

	/**
	 * Sets the time on all channels
	 * @param {number} time
	 */
	TimelineComponent.prototype.setTime = function (time) {
		for (var i = 0; i < this.channels.length; i++) {
			var channel = this.channels[i];

			channel.setTime(time);
		}
	};

	return TimelineComponent;
});