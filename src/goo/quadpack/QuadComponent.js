define([
	'goo/entities/components/Component',
	'goo/renderer/MeshData',
	'goo/shapes/Quad',
	'goo/entities/components/MeshDataComponent',
	'goo/entities/components/MeshRendererComponent',
	'goo/renderer/shaders/ShaderLib',
	'goo/renderer/Material',
	'goo/util/ObjectUtil',
	'goo/renderer/Texture'
],
/** @lends */
function (
	Component,
	MeshData,
	Quad,
	MeshDataComponent,
	MeshRendererComponent,
	ShaderLib,
	Material,
	_,
	Texture
) {
	'use strict';

	/**
	 * @class Quad component that holds a unit [Quad]{@link Quad} mesh and a [Material]{@link Material}. It makes it easy to create a textured quad in 3D space, for example a logotype. When the component is added to the world, all other needed components are automatically added to the entity. Make sure your add a [QuadSystem]{@link QuadSystem} to the world before you start using this component.
	 * @see QuadSystem
	 * @param {HTMLImageElement} [image]
	 * @param {object} [settings]
	 * @param {number} [settings.width=1]	Width of the Quad mesh. See [Quad]{@link Quad}
	 * @param {number} [settings.height=1]
	 * @param {number} [settings.tileX=1]	Number of tiles in the Quad. See [Quad]{@link Quad}
	 * @param {number} [settings.tileY=1]
	 * @param {number} [settings.preserveAspectRatio=true] Will resize the Quad mesh so that the aspect is preserved.
	 * @extends {Component}
	 */
	function QuadComponent(image, settings) {
		settings = settings || {};
		var defaults = {
			width	: 1,
			height	: 1,
			tileX	: 1,
			tileY	: 1,
			preserveAspectRatio : true
		};
		_.defaults(settings,defaults);

		this.type = 'QuadComponent';

		if(settings.preserveAspectRatio && image && image.width && image.height){
			var ratio = image.width / image.height;
			if(ratio > 1){
				settings.height = settings.width / ratio;
			} else if(ratio < 1){
				settings.width = settings.height * ratio;
			}
		}

		/** The quad meshdata.
		 * @type {Quad}
		 * @private
		 */
		this.meshData = new Quad(settings.width,settings.height,settings.tileX,settings.tileY);

		/** Mesh data component that this component creates and adds to the entity.
		 * @type {MeshDataComponent}
		 * @private
		 */
		this.meshDataComponent = new MeshDataComponent(this.meshData);

		/** Mesh renderer component that this component creates and adds to the entity.
		 * @type {MeshRendererComponent}
		 * @private
		 */
		this.meshRendererComponent = new MeshRendererComponent();

		/** The material currently used by the component.
		 * @type {Material}
		 */
		this.material = new Material(ShaderLib.uber, 'QuadComponent default material');

		// Set the material as current
		var m = this.material;
		this.meshRendererComponent.materials = [m];
		m.blendState.blending = 'CustomBlending';	// Needed if the quad has transparency
		m.renderQueue = 2000;
		m.dualTransparency = true;					// Visible on both sides

		if(image){
			var texture = new Texture(image);
			m.setTexture('DIFFUSE_MAP',texture);
		}
	}
	QuadComponent.prototype = Object.create(Component.prototype);
	QuadComponent.prototype.constructor = QuadComponent;

	QuadComponent.prototype.attached = function(entity) {
		entity.setComponent(entity.quadComponent.meshRendererComponent);
		entity.setComponent(entity.quadComponent.meshDataComponent);
	};

	QuadComponent.prototype.detached = function(entity) {
		entity.clearComponent('meshRendererComponent');
		entity.clearComponent('meshDataComponent');
	};

	QuadComponent.prototype.setMaterial = function(material) {
		this.material = material;
		this.meshRendererComponent.materials = [material];
	};

	return QuadComponent;
});
