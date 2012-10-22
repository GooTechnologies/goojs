"use strict";

define([ 'goo/entities/systems/System' ], function(System) {
	function PartitioningSystem() {
		System.call(this, 'PartitioningSystem', [ 'MeshRendererComponent' ]);

		this.renderList = [];
	}

	PartitioningSystem.prototype = Object.create(System.prototype);

	PartitioningSystem.prototype.inserted = function(entity) {
		if (this.partitioner) {
			this.partitioner.added(entity);
		}
	};

	PartitioningSystem.prototype.deleted = function(entity) {
		if (this.partitioner) {
			this.partitioner.removed(entity);
		}
	};

	PartitioningSystem.prototype.process = function(entities) {
		this.renderList.length = 0;
		if (this.partitioner) {
			this.partitioner.process(entities, this.renderList);
		} else {
			for ( var i in entities) {
				var entity = entities[i];
				this.renderList.push(entity);
			}
		}
	};

	return PartitioningSystem;
});