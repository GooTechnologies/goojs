var System = require('../entities/systems/System');

/**
 * Manages entities with a TimelineComponent
 * @example-link http://code.gooengine.com/latest/visual-test/goo/timelinepack/TimelineComponent/TimelineComponent-vtest.html Working example
 */
var TimelineSystem: any = function TimelineSystem() {
	System.call(this, 'TimelineSystem', ['TimelineComponent']);
}

TimelineSystem.prototype = Object.create(System.prototype);
TimelineSystem.prototype.constructor = TimelineSystem;

TimelineSystem.prototype.process = function (entities, tpf) {
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
	var entities = this._activeEntities;
	for (var i = 0; i < entities.length; i++) {
		var component = entities[i].timelineComponent;
		if (component.autoStart) {
			component.start();
		}
	}
};

/**
 * Stops updating the entities
 */
TimelineSystem.prototype.pause = function () {
	this.passive = true;
	var entities = this._activeEntities;
	for (var i = 0; i < entities.length; i++) {
		var component = entities[i].timelineComponent;
		component.pause();
	}
};

/**
 * Resumes updating the entities; an alias for `.play`
 */
TimelineSystem.prototype.resume = TimelineSystem.prototype.play;

/**
 * Stop updating entities and resets the state machines to their initial state
 */
TimelineSystem.prototype.stop = function () {
	this.passive = true;
	var entities = this._activeEntities;
	for (var i = 0; i < entities.length; i++) {
		var component = entities[i].timelineComponent;
		component.stop();
	}
};

export = TimelineSystem;