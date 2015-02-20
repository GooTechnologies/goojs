define([
	'goo/entities/systems/System'
], function (System) {
	'use strict';

	/**
	 * Processes all entities with transform components, making sure they are up to date and valid according to the "scenegraph"
	 * @example-link http://code.gooengine.com/latest/visual-test/goo/entities/components/TransformComponent/TransformComponent-vtest.html Working example
	 * @extends System
	 */
	function TransformSystem() {
		System.call(this, 'TransformSystem', ['TransformComponent']);

		this.numUpdates = 0;

		this._list = [];

		this.traverseFunc = function (entity) {
			entity.transformComponent.updateWorldTransform();
			this.numUpdates++;
		}.bind(this);

		this.traverseFuncWithCheck = function (entity) {
			if (entity.transformComponent._dirty) {
				entity.traverse(this.traverseFunc);
				return false;
			}
		}.bind(this);
	}

	TransformSystem.prototype = Object.create(System.prototype);
	TransformSystem.prototype.constructor = TransformSystem;

	TransformSystem.prototype.process = function (entities) {
		this.numUpdates = 0;

		var i, l, transformComponent;
		var index = 0;
		for (i = 0, l = entities.length; i < l; i++) {
			transformComponent = entities[i].transformComponent;
			transformComponent._updated = false;
			if (transformComponent._dirty) {
				transformComponent.updateTransform();
			}
			if (transformComponent.parent === null) {
				this._list[index++] = entities[i];
			}
		}

		// Traverse from root nodes and down, depth first
		for (i = 0; i < index; i++) {
			this._list[i].traverse(this.traverseFuncWithCheck);
		}
	};

	return TransformSystem;
});