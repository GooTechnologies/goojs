define([
	'goo/entities/components/Component',
	'goo/renderer/MeshData',
	'goo/shapes/Quad',
	'goo/entities/components/MeshDataComponent',
	'goo/entities/components/MeshRendererComponent',
	'goo/renderer/shaders/ShaderLib',
	'goo/renderer/Material'
],
/** @lends */
function (
	Component,
	MeshData,
	Quad,
	MeshDataComponent,
	MeshRendererComponent,
	ShaderLib,
	Material
) {
	'use strict';

	/**
	 * @class Quad component that holds mesh and a material.
	 */
	function QuadComponent(material) {
		this.type = QuadComponent.type;
		this.meshData = new Quad(); // 1x1 quad
		this.meshDataComponent = new MeshDataComponent(this.meshData);
		this.meshRendererComponent = new MeshRendererComponent(this.meshRendererComponent);
		this.material = material || QuadComponent.DEFAULT_MATERIAL;

		this.attachMaterial();
	}
	QuadComponent.prototype = Object.create(Component.prototype);
	QuadComponent.prototype.constructor = QuadComponent;

	QuadComponent.type = 'QuadComponent';

	QuadComponent.DEFAULT_MATERIAL = new Material(ShaderLib.uber, 'QuadComponent default material');

	QuadComponent.prototype.attachMaterial = function(){
		var idx = this.meshRendererComponent.materials.indexOf(this.material);
		if(idx === -1){
			// Material not added yet. Add!
			this.meshRendererComponent.materials.push(this.material);
		}
	};

	QuadComponent.prototype.removeMaterial = function(){
		var idx = this.meshRendererComponent.materials.indexOf(this.material);
		if(idx !== -1){
			// Material found. remove!
			this.meshRendererComponent.materials.splice(idx,1);
		}
	};

	/*
	QuadComponent.applyOnEntity = function(obj, entity) {
		//TODO
	};
	*/

	return QuadComponent;
});
