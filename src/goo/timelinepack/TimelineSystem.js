define([
	'goo/entities/systems/System'
], function (
	System
	) {
	'use strict';

	function TimelineSystem() {
		System.call(this, 'TimelineSystem', ['TimelineComponent']);
	}

	TimelineSystem.prototype = Object.create(System.prototype);
	TimelineSystem.prototype.constructor = TimelineSystem;

	//! AT: why do we pass entities when this._activeEntities is the same is beyond me
	TimelineSystem.prototype.process = function (entities, tpf) {
		for (var i = 0; i < this._activeEntities.length; i++) {
			var entity = this._activeEntities[i];

			entity.timelineComponent.update(tpf);
		}
	};

	return TimelineSystem;
});
