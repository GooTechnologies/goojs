"use strict";

define([ 'goo/renderer/BoundingSphere' ], function(BoundingSphere) {
	function MeshDataComponent(meshData) {
		this.type = 'MeshDataComponent';

		this.meshData = meshData;

		this.modelBound = new BoundingSphere();
		this.autoCompute = true;
	}

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