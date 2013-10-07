define([
	'goo/renderer/bounds/BoundingSphere',
	'goo/entities/components/Component'
],
/** @lends */
function (
	BoundingSphere,
	Component
) {
	"use strict";

	/**
	 * @class Holds the mesh data, like vertices, normals, indices etc. Also defines the local bounding volume.
	 * @param {MeshData} meshData Target mesh data for this component.
	 */
	function MeshDataComponent(meshData) {
		this.type = 'MeshDataComponent';

		this.meshData = meshData;
	}

	MeshDataComponent.prototype = Object.create(Component.prototype);

	return MeshDataComponent;
});