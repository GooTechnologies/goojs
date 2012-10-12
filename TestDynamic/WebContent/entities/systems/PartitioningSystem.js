define(function() {
	function PartitioningSystem(renderList) {
		System.call(this, 'PartitioningSystem', [ 'MeshRendererComponent' ]);

		this.renderList = renderList;
	}

	PartitioningSystem.prototype = Object.create(System.prototype);

	PartitioningSystem.prototype.inserted = function(entity) {

	};

	PartitioningSystem.prototype.deleted = function(entity) {

	};

	PartitioningSystem.prototype.process = function(entities) {
		renderList.length = 0;
		for (i in entities) {
			var entity = entities[i];

			var bounds = entity.MeshRendererComponent.worldBound;

			var isVisible = THREE.WebGLRenderer._frustum.contains(bounds);

			if (isVisible) {
				renderList.push(entity);
			}
		}
	};

	return PartitioningSystem;
});