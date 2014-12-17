define([
	'goo/renderer/bounds/BoundingBox',
	'goo/entities/components/Component',
	'goo/renderer/MeshData'
], function (
	BoundingBox,
	Component,
	MeshData
) {
	'use strict';

	/**
	 * Holds the mesh data, like vertices, normals, indices etc. Also defines the local bounding volume.<br>
	 * {@linkplain http://code.gooengine.com/latest/examples/goo/entities/components/MeshDataComponent/MeshDataComponent-example.html Working example}
	 * @param {MeshData} meshData Target mesh data for this component.
	 * @extends Component
	 */
	function MeshDataComponent(meshData) {
		Component.apply(this, arguments);

		this.type = 'MeshDataComponent';

		/**
		 * @type {MeshData}
		 */
		this.meshData = meshData;

		/** Bounding volume in local space.
		 * @type {BoundingVolume}
		 */
		this.modelBound = new BoundingBox();

		/** Automatically compute bounding fit.
		 * @type {boolean}
		 * @default
		 */
		this.autoCompute = true;

		/**
		 * @type {SkeletonPose}
		 * @default
		 */
		this.currentPose = null; // SkeletonPose
	}

	MeshDataComponent.type = 'MeshDataComponent';

	MeshDataComponent.prototype = Object.create(Component.prototype);
	MeshDataComponent.prototype.constructor = MeshDataComponent;

	/**
	 * Set the bounding volume type (sphere, box etc).
	 *
	 * @param {BoundingVolume} modelBound Bounding to apply to this meshdata component.
	 * @param {boolean} autoCompute If true, automatically compute bounding fit.
	 */
	MeshDataComponent.prototype.setModelBound = function (modelBound, autoCompute) {
		this.modelBound = modelBound;
		this.autoCompute = autoCompute;
	};

	/**
	 * Compute bounding center and bounds for this mesh.
	 */
	MeshDataComponent.prototype.computeBoundFromPoints = function () {
		if (this.autoCompute && this.modelBound !== null && this.meshData) {
			var verts = this.meshData.getAttributeBuffer('POSITION');
			if (verts !== undefined) {
				this.modelBound.computeFromPoints(verts);
				this.autoCompute = false;
			}
		}
	};

	MeshDataComponent.applyOnEntity = function (obj, entity) {
		if (obj instanceof MeshData) {
			var meshDataComponent = new MeshDataComponent(obj);
			entity.setComponent(meshDataComponent);
			return true;
		}
	};

	return MeshDataComponent;
});