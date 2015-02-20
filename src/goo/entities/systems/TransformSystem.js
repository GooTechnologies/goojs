define([
	'goo/entities/systems/System'
], function (System) {
	'use strict';

	// has to stay here because it's used by traverseFunc below
	// it's pretty crappy how it's sprinkled over the code
	var numUpdates;

	/**
	 * Processes all entities with transform components, making sure they are up to date and valid according to the "scenegraph"
	 * @example-link http://code.gooengine.com/latest/visual-test/goo/entities/components/TransformComponent/TransformComponent-vtest.html Working example
	 * @extends System
	 */
	function TransformSystem() {
		System.call(this, 'TransformSystem', ['TransformComponent']);
		this.numUpdates = 0;
		this.list = [];
	}

	TransformSystem.prototype = Object.create(System.prototype);
	TransformSystem.prototype.constructor = TransformSystem;

	TransformSystem.prototype.process = function (entities) {
		numUpdates = 0;
		var i, transformComponent;
		// var index = 0;
		for (i = 0; i < entities.length; i++) {
			transformComponent = entities[i].transformComponent;
			transformComponent._updated = false;
			if (transformComponent._dirty) {
				transformComponent.updateTransform();
			}
			// if (transformComponent.parent === null) {
			// 	this.list[index++] = entities[i];
			// }
		}
		// this.list.length = index;

		// Traverse from root nodes and down, depth first
		for (i = 0; i < entities.length; i++) {
			var entity = entities[i];
		// for (i = 0; i < this.list.length; i++) {
			// var entity = this.list[i];
			transformComponent = entity.transformComponent;
			if (transformComponent.parent === null) {
				entity.traverse(traverseFunc);
			}
		}

		this.numUpdates = numUpdates;
	};

	function traverseFunc(entity) {
		if (entity.transformComponent._dirty) {
			entity.transformComponent.updateWorldTransform();
			numUpdates++;
			// Set children to dirty
			var children = entity.transformComponent.children;
			for (var j = 0; j < children.length; j++) {
				children[j]._dirty = true;
			}
		}
	}

	return TransformSystem;
});