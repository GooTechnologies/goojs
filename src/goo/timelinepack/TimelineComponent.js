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

	TimelineComponent.prototype.addChannel = function (channel) {
		this.channels.push(channel);
	};

	TimelineComponent.prototype.update = function (tpf) {
		for (var i = 0; i < this.channels.length; i++) {
			var channel = this.channels[i];

			channel.update(tpf);
		}
	};

	TimelineComponent.prototype.setTime = function (time) {
		for (var i = 0; i < this.channels.length; i++) {
			var channel = this.channels[i];

			channel.setTime(time);
		}
	};
});