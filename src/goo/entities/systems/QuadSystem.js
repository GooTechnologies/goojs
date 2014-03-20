define([
	'goo/entities/systems/System',
	'goo/sound/AudioContext',
	'goo/math/Vector3',
	'goo/math/MathUtils',
	'goo/entities/SystemBus',
	'goo/util/ObjectUtil'
],
/** @lends */
function(
	System,
	AudioContext,
	Vector3,
	MathUtils,
	SystemBus,
	_
) {
	'use strict';
	/**
	 * @class System responsible for sound
	 */
	function QuadSystem() {
		System.call(this, 'QuadSystem', ['QuadComponent']);
		this.passive = true; // Makes world skip the process step
	}

	QuadSystem.prototype = Object.create(System.prototype);
	QuadSystem.prototype.constructor = QuadSystem;

	/**
	 * Called by world.process()
	 * @param {Entity} entity
	 * @private
	 */
	QuadSystem.prototype.inserted = function(entity) {
		entity.setComponent(entity.quadComponent.meshRendererComponent);
		entity.setComponent(entity.quadComponent.meshDataComponent);
	};

	/**
	 * Makes sure the connected meshData and meshRenderer is removed when the component is removed. Called by world.process(). Sometimes this has already been done by the loader.
	 * @param {Entity} entity
	 * @private
	 */
	QuadSystem.prototype.deleted = function(entity) {
		if (entity.quadComponent) {
			entity.clearComponent('meshRendererComponent');
			entity.clearComponent('meshDataComponent');
		}
	};

	return QuadSystem;
});