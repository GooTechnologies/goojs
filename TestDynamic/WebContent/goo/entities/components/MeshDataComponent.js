"use strict";

define(function() {
	function MeshDataComponent(meshData) {
		this.type = 'MeshDataComponent';

		this.meshData = meshData;

		this.modelBound = {
			center : new THREE.Vector3(),
			radius : 0,
			computeFromPoints : function(verts) {
				// calcWelzl(points);
				this.radius = 5;
			},
			transform : function(transform, bound) {
				// this.bound.center.addSelf(transform.translation);
				return bound;
			}
		};
		this.autoCompute = true;
	}

	MeshDataComponent.prototype.setModelBound = function(modelBound, autoCompute) {
		this.modelBound = modelBound;
		this.autoCompute = autoCompute;
	};

	MeshDataComponent.prototype.computeBoundFromPoints = function() {
		if (this.autoCompute && this.modelBound != null) {
			var verts = this.meshData.getAttributeBuffer('POSITION');
			if (verts != null) {
				this.modelBound.computeFromPoints(verts);
				this.autoCompute = false;
			}
		}
	};

	return MeshDataComponent;
});