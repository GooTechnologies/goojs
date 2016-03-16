import Component from '../entities/components/Component';
import DoubleQuad from '../quadpack/DoubleQuad';
import MeshDataComponent from '../entities/components/MeshDataComponent';
import MeshRendererComponent from '../entities/components/MeshRendererComponent';
import ShaderLib from '../renderer/shaders/ShaderLib';
import Material from '../renderer/Material';
import ObjectUtils from '../util/ObjectUtils';
import Texture from '../renderer/Texture';



	/**
	 * Quad component that holds a unit [Quad]{@link Quad} mesh and a [Material]{@link Material}. It makes it easy to create a textured quad in 3D space, for example a logotype. When the component is added to the world, all other needed components are automatically added to the entity. Make sure your add a [QuadSystem]{@link QuadSystem} to the world before you start using this component.
	 * @see QuadSystem
	 * @param {HTMLImageElement} [image]
	 * @param {Object} [settings]
	 * @param {number} [settings.width=1]	Width of the Quad mesh. See [Quad]{@link Quad}
	 * @param {number} [settings.height=1]
	 * @param {number} [settings.tileX=1]	Number of tiles in the Quad. See [Quad]{@link Quad}
	 * @param {number} [settings.tileY=1]
	 * @param {number} [settings.preserveAspectRatio=true] Will resize the Quad mesh so that the aspect is preserved.
	 * @extends {Component}
	 * @example-link http://code.gooengine.com/latest/visual-test/goo/quadpack/QuadComponent/QuadComponent-vtest.html Working example
	 */
	function QuadComponent(image, settings) {
		Component.apply(this, arguments);

		settings = settings || {};
		var defaults = {
			width: 1,
			height: 1,
			tileX: 1,
			tileY: 1,
			preserveAspectRatio : true
		};
		ObjectUtils.defaults(settings, defaults); //! AT: this will mutate settings which is BAD!!!

		this.type = 'QuadComponent';

		/**
		 * The width of the component in 3D space
		 */
		this.width = settings.width;
		this.oldWidth = 0;

		/**
		 * The height of the component in 3D space
		 */
		this.height = settings.height;
		this.oldHeight = 0;

		/**
		 * Tiling in x direction
		 */
		this.tileX = settings.tileX;
		this.oldTileX = 0;

		/**
		 * Tiling in y direction
		 */
		this.tileY = settings.tileY;
		this.oldTileY = 0;

		/**
		 * Whether to preserve aspect ratio or not. If this property is true, the component will have a maximum dimension of 1 in the 3D space.
		 */
		this.preserveAspectRatio = settings.preserveAspectRatio;

		/** Mesh renderer component that this component creates and adds to the entity.
		 * @type {MeshRendererComponent}
		 * @private
		 */
		this.meshRendererComponent = new MeshRendererComponent();

		/** The material currently used by the component.
		 * @type {Material}
		 */
		this.material = new Material(ShaderLib.uber, 'QuadComponent default material');

		/** The quad meshdata.
		 * @type {Quad}
		 * @private
		 */
		this.meshData = new DoubleQuad(settings.width, settings.height, settings.tileX, settings.tileY);

		/** Mesh data component that this component creates and adds to the entity.
		 * @type {MeshDataComponent}
		 * @private
		 */
		this.meshDataComponent = new MeshDataComponent(this.meshData);

		// Set the material as current
		var material = this.material;
		material.blendState.blending = 'TransparencyBlending';	// Needed if the quad has transparency
		material.renderQueue = 2000;
		material.uniforms.discardThreshold = 0.1;
		this.setMaterial(material);

		if (image) {
			var texture = new Texture(image);
			texture.anisotropy = 16;
			texture.wrapS = 'EdgeClamp';
			texture.wrapT = 'EdgeClamp';
			material.setTexture('DIFFUSE_MAP', texture);
		}

		this.rebuildMeshData();
	}
	QuadComponent.prototype = Object.create(Component.prototype);
	QuadComponent.prototype.constructor = QuadComponent;

	QuadComponent.prototype.attached = function (entity) {
		entity.setComponent(entity.quadComponent.meshRendererComponent);
		entity.setComponent(entity.quadComponent.meshDataComponent);
	};

	QuadComponent.prototype.detached = function (entity) {
		entity.clearComponent('meshRendererComponent');
		entity.clearComponent('meshDataComponent');
	};

	QuadComponent.prototype.destroy = function (context) {
		this.meshData.destroy(context);
	};

	/**
	 * Set the current material for the quad
	 * @param Material material
	 */
	QuadComponent.prototype.setMaterial = function (material) {
		this.material = material;
		this.meshRendererComponent.materials = [material];
		// REVIEW: Don't set this stuff here, set it in the data model
	};

	/**
	 * Re-build the meshData for the meshDataComponent.
	 */
	QuadComponent.prototype.rebuildMeshData = function () {
		var material = this.material;

		// Resize so it keeps aspect ratio
		var texture = material.getTexture('DIFFUSE_MAP');
		if (!texture) {
			return;
		}

		var image = texture.image;
		if (!image) {
			return;
		}

		if (this.preserveAspectRatio && image) {
			var width = image.originalWidth || image.svgWidth || image.width;
			var height = image.originalHeight || image.svgHeight || image.height;

			this.width = width / 100;
			this.height = height / 100;
		}

		// Only rebuild the mesh if any of its properties actually changed.
		if (this.width !== this.oldWidth ||
			this.height !== this.oldHeight ||
			this.tileX !== this.oldTileX ||
			this.tileY !== this.oldTileY
		) {
			this.oldWidth = this.width;
			this.oldHeight = this.height;
			this.oldTileX = this.tileX;
			this.oldTileY = this.tileY;

			var meshData = this.meshData;
			meshData.xExtent = this.width * 0.5;
			meshData.yExtent = this.height * 0.5;
			meshData.tileX = this.tileX;
			meshData.tileY = this.tileY;
			meshData.rebuild();
			meshData.setVertexDataUpdated();
		}
	};

	export default QuadComponent;

