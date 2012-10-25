define(function() {
	"use strict";

	function MeshRendererComponent() {
		this.type = 'MeshRendererComponent';

		this.materials = [];
		this.worldBound = null;
	}

	MeshRendererComponent.prototype.updateBounds = function(bounding, transform) {
		this.worldBound = bounding.transform(transform, this.worldBound);
	};

	return MeshRendererComponent;
});