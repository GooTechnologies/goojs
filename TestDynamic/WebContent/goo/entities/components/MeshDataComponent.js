define(['goo/renderer/BoundingSphere', 'goo/entities/components/Component'], function(BoundingSphere, Component) {
	"use strict";

	function MeshDataComponent(meshData) {
		this.type = 'MeshDataComponent';

		this.meshData = meshData;

		this.modelBound = new BoundingSphere();
		this.autoCompute = true;
	}

	MeshDataComponent.prototype = Object.create(Component.prototype);

	MeshDataComponent.prototype.setModelBound = function(modelBound, autoCompute) {
		this.modelBound = modelBound;
		this.autoCompute = autoCompute;
	};

	MeshDataComponent.prototype.computeBoundFromPoints = function() {
		if (this.autoCompute && this.modelBound !== null) {
			var verts = this.meshData.getAttributeBuffer('POSITION');
			if (verts !== undefined) {
				this.modelBound.computeFromPoints(verts);
				this.autoCompute = false;
			}
		}
	};

	return MeshDataComponent;
});