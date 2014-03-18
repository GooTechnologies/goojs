define([
	'goo/entities/components/Component',
	'goo/renderer/MeshData'
],
/** @lends */
function (
	Component,
	MeshData
) {
	'use strict';

	/**
	 * @class Holds the mesh data, like vertices, normals, indices etc. Also defines the local bounding volume.
	 * @param {MeshData} meshData Target mesh data for this component.
	 */
	function QuadComponent(meshData,material) {
		this.type = 'QuadComponent';
		this.meshData = meshData;
		this.material = material;
	}

	QuadComponent.type = 'QuadComponent';

	QuadComponent.prototype = Object.create(Component.prototype);
	QuadComponent.prototype.constructor = QuadComponent;

	/*
	QuadComponent.applyOnEntity = function(obj, entity) {
		//TODO
	};
	*/

	return QuadComponent;
});
