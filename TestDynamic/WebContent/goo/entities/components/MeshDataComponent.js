define(function() {
	function MeshDataComponent(meshData) {
		this.type = 'MeshDataComponent';

		this.meshData = meshData;

		this.modelBound = {
			radius : 0,
			computeFromPoints : function(verts) {
				// calcWelzl(points);
				radius = 5;
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