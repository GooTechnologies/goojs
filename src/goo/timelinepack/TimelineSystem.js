define([
	'goo/entities/systems/System'
], function (
	System
) {
	'use strict';

	/**
	 * Manages entities with a TimelineComponent
	 * @example-link http://code.gooengine.com/latest/visual-test/goo/timelinepack/TimelineComponent/TimelineComponent-vtest.html Working example
	 */
	function TimelineSystem() {
		System.call(this, 'TimelineSystem', ['TimelineComponent']);
	}

	TimelineSystem.prototype = Object.create(System.prototype);
	TimelineSystem.prototype.constructor = TimelineSystem;

	TimelineSystem.prototype.process = function (entities, tpf) {
		if (this.resetRequest) {
			var component;
			this.resetRequest = false;
			for (var i = 0; i < entities.length; i++) {
				component = entities[i].timelineComponent;
				component.stop();
				if (component.autoStart) {
					component.start();
				}
			}
			this.time = 0;
			this.passive = true;
			return;
		}

		for (var i = 0; i < this._activeEntities.length; i++) {
			var entity = this._activeEntities[i];

			entity.timelineComponent.update(tpf);
		}
	};

	/**
	 * Resumes updating the entities
	 */
	TimelineSystem.prototype.play = function () {
		this.passive = false;
		if (!this.paused) {
			this.entered = true;
		}
		this.paused = false;
	};

	/**
	 * Stops updating the entities
	 */
	TimelineSystem.prototype.pause = function () {
		this.passive = true;
		this.paused = true;
	};

	/**
	 * Resumes updating the entities; an alias for `.play`
	 */
	TimelineSystem.prototype.resume = TimelineSystem.prototype.play;

	/**
	 * Stop updating entities and resets the state machines to their initial state
	 */
	TimelineSystem.prototype.stop = function () {
		this.passive = false;
		this.resetRequest = true;
		this.paused = false;
	};

	return TimelineSystem;
});
