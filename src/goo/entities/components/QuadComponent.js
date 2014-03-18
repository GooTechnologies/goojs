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
	function QuadComponent(material) {
		this.type = 'QuadComponent';
		this.meshData = new Quad();
		this.meshDataComponent = new MeshDataComponent(this.meshData);
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
		entity.setComponent(this.meshDataComponent);
	};

	return QuadComponent;
});
