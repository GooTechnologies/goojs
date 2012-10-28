define(['goo/entities/components/Component'], function(Component) {
	"use strict";

	function MeshRendererComponent() {
		this.type = 'MeshRendererComponent';

		this.materials = [];
		this.worldBound = null;

		this.castShadow = false;
		this.receiveShadow = false;
	}

	MeshRendererComponent.prototype = Object.create(Component.prototype);

	MeshRendererComponent.prototype.updateBounds = function(bounding, transform) {
		this.worldBound = bounding.transform(transform, this.worldBound);
	};

	return MeshRendererComponent;
});