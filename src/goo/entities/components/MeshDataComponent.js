define([
	'goo/renderer/bounds/BoundingSphere',
	'goo/entities/components/Component',
	'goo/shapes/ShapeCreator'
],
/** @lends */
function (
	BoundingSphere,
	Component,
	ShapeCreator
) {
	"use strict";

	var defaultMeshData = ShapeCreator.createBox(1, 1, 1);

	/**
	 * @class Holds the mesh data, like vertices, normals, indices etc. Also defines the local bounding volume.
	 * @param {MeshData} meshData Target mesh data for this component.
	 */
	function MeshDataComponent(meshData) {
		this.type = 'MeshDataComponent';

		this.meshData = meshData || defaultMeshData;

		/** Bounding volume in local space
		 * @type {BoundingVolume}
		 * @default
		 */
		this.modelBound = new BoundingSphere();
		/** Automatically compute bounding fit
		 * @type {boolean}
		 * @default
		 */
		this.autoCompute = true;
		this.currentPose = null;

		this.api = {
			'meshDataComponent': this
		};
	}

	MeshDataComponent.prototype = Object.create(Component.prototype);

	/**
	 * Set the bounding volume type (sphere, box etc)
	 *
	 * @param {BoundingVolume} modelBound Bounding to apply to this meshdata component
	 * @param {boolean} autoCompute If true, automatically compute bounding fit
	 */
	MeshDataComponent.prototype.setModelBound = function (modelBound, autoCompute) {
		this.modelBound = modelBound;
		this.autoCompute = autoCompute;
	};

	/**
	 * Compute bounding center and bounds for this mesh
	 */
	MeshDataComponent.prototype.computeBoundFromPoints = function () {
		if (this.autoCompute && this.modelBound !== null) {
			var verts = this.meshData.getAttributeBuffer('POSITION');
			if (verts !== undefined) {
				this.modelBound.computeFromPoints(verts);
				this.autoCompute = false;
			}
		}
	};

	/**
	* Clones the component
	*/

	MeshDataComponent.prototype.clone = function() {
		var theClone         = new MeshDataComponent( this.meshData );
		theClone.autoCompute = this.autoCompute;
		theClone.currentPose = this.currentPose;
		return theClone;
	};

	return MeshDataComponent;
});