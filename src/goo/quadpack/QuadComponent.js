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
	 * @class Quad component that holds a unit [Quad]{@link Quad} mesh and a [Material]{@link Material}. It makes it easy to create a textured quad in 3D space, for example a logotype. When the component is added to the world, all other needed components are automatically added to the entity. Make sure your add a [QuadSystem]{@link QuadSystem} to the world before you start using this component.
	 * @see QuadSystem
	 * @param {Material} [material] If none was given, a default material is used.
	 * @extends {Component}
	 */
	function QuadComponent(material) {
		this.type = QuadComponent.type;

		/** The quad meshdata.
		 * @type {Quad}
		 * @private
		 */
		this.meshData = new Quad();

		/** Mesh data component that this component creates and adds to the entity.
		 * @type {MeshDataComponent}
		 * @private
		 */
		this.meshDataComponent = new MeshDataComponent(this.meshData);

		/** Mesh renderer component that this component creates and adds to the entity.
		 * @type {MeshRendererComponent}
		 * @private
		 */
		this.meshRendererComponent = new MeshRendererComponent(this.meshRendererComponent);

		/** The material currently used by the component.
		 * @type {Material}
		 */
		this.material = material || QuadComponent.DEFAULT_MATERIAL;

		this.attachMaterial();
	}
	QuadComponent.prototype = Object.create(Component.prototype);
	QuadComponent.prototype.constructor = QuadComponent;

	QuadComponent.type = 'QuadComponent';

	/**
	 * Used if no material was given to the constructor.
	 * @static
	 * @type {Material}
	 */
	QuadComponent.DEFAULT_MATERIAL = new Material(ShaderLib.uber, 'QuadComponent default material');

	/**
	 * Attaches the current material to the meshrenderer component.
	 */
	QuadComponent.prototype.attachMaterial = function () {
		var idx = this.meshRendererComponent.materials.indexOf(this.material);
		if (idx === -1) {
			// Material not added yet. Add!
			this.meshRendererComponent.materials.push(this.material);
		}
	};

	/**
	 * Removes the current material from the meshrenderer component.
	 */
	QuadComponent.prototype.removeMaterial = function () {
		var idx = this.meshRendererComponent.materials.indexOf(this.material);
		if (idx !== -1) {
			// Material found. remove!
			this.meshRendererComponent.materials.splice(idx, 1);
		}
	};

	return QuadComponent;
});
