define([
	'goo/entities/systems/System'
],
/** @lends */
function(
	System
) {
	'use strict';
	/**
	 * @class System responsible for quads.
	 * @see {QuadComponent}
	 * @extends {System}
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