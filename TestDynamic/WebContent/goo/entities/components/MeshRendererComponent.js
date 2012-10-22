"use strict";

define(function() {
	function MeshRendererComponent() {
		this.type = 'MeshRendererComponent';

		this.materials = [];
		this.worldBound = null;
	}

	MeshRendererComponent.prototype.updateBounds = function(bounding, transform) {
		this.worldBound = bounding.transform(transform, bounding);
	};

	return MeshRendererComponent;
});