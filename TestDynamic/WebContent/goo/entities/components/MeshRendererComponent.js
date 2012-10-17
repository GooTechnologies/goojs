define(function() {
	function MeshRendererComponent() {
		this.type = 'MeshRendererComponent';

		this.materials = [];
		this.worldBound = null;
	}

	MeshRendererComponent.prototype.updateBounds = function(bounding, transform) {
		worldBound = bounding.transform(transform, worldBound);
	};

	return MeshRendererComponent;
});