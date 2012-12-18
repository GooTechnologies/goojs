define(['goo/entities/systems/System', 'goo/entities/EventHandler'], function (System, EventHandler) {
	"use strict";

	/**
	 * @name PartitioningSystem
	 * @class Processes all entities with meshrenderer components, and uses its partitioner to calculate which entities to render.
	 */
	function PartitioningSystem() {
		System.call(this, 'PartitioningSystem', ['MeshRendererComponent']);

		this.partitioner = null;
		this.renderList = [];
		this.camera = null;

		var that = this;
		EventHandler.addListener({
			setCurrentCamera : function (camera) {
				that.camera = camera;
			}
		});
	}

	PartitioningSystem.prototype = Object.create(System.prototype);

	PartitioningSystem.prototype.inserted = function (entity) {
		if (this.partitioner) {
			this.partitioner.added(entity);
		}
	};

	PartitioningSystem.prototype.deleted = function (entity) {
		if (this.partitioner) {
			this.partitioner.removed(entity);
		}
	};

	PartitioningSystem.prototype.process = function (entities) {
		this.renderList.length = 0;
		if (this.partitioner && this.camera) {
			this.partitioner.process(this.camera, entities, this.renderList);
		} else {
			// Nothing will render
		}
	};

	return PartitioningSystem;
});