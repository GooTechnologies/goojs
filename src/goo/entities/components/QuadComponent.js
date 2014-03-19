define([
	'goo/entities/components/Component',
	'goo/renderer/MeshData',
	'goo/shapes/Quad',
	'goo/entities/components/MeshDataComponent'
],
/** @lends */
function (
	Component,
	MeshData,
	Quad,
	MeshDataComponent
) {
	'use strict';

	/**
	 * @class Quad component that holds mesh and a material.
	 */
	function QuadComponent(meshData, material, meshRendererComponent, meshDataComponent) {
		this.type = 'QuadComponent';
		this.meshData = meshData;
		this.meshDataComponent = meshDataComponent;
		this.meshRendererComponent = meshRendererComponent;
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

	QuadComponent.prototype.attached = function(entity){
		entity.clearComponent('meshRendererComponent');
		entity.clearComponent('meshDataComponent');
	};

	return QuadComponent;
});
