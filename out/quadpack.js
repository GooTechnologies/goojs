goo.DoubleQuad = (function (
	MeshData
) {
	'use strict';

	/**
	 * A rectangular, two dimensional shape. The local height of the
	 * DoubleQuad defines it's size about the y-axis, while the width defines
	 * the x-axis. The z-axis will always be 0.
	 * @example-link http://code.gooengine.com/latest/visual-test/goo/quadpack/DoubleQuad/DoubleQuad-vtest.html Working example
	 * @param {number} [width=1] Total width of quad.
	 * @param {number} [height=1] Total height of quad.
	 * @param {number} [tileX=1] Number of texture repetitions in the texture's x direction.
	 * @param {number} [tileY=1] Number of texture repetitions in the texture's y direction.
	 */
	function DoubleQuad(width, height, tileX, tileY) {
		if (arguments.length === 1 && arguments[0] instanceof Object) {
			var props = arguments[0];
			width = props.width;
			height = props.height;
			tileX = props.tileX;
			tileY = props.tileY;
		}

		/** Half-extent along the local x axis.
		 * @type {number}
		 * @default 0.5
		 */
		this.xExtent = width !== undefined ? width * 0.5 : 0.5;

		/** Half-extent along the local y axis.
		 * @type {number}
		 * @default 0.5
		 */
		this.yExtent = height !== undefined ? height * 0.5 : 0.5;

		/** Number of texture repetitions in the texture's x direction.
		 * @type {number}
		 * @default 1
		 */
		this.tileX = tileX || 1;

		/** Number of texture repetitions in the texture's y direction.
		 * @type {number}
		 * @default 1
		 */
		this.tileY = tileY || 1;

		var attributeMap = MeshData.defaultMap([
			MeshData.POSITION,
			MeshData.NORMAL,
			MeshData.TEXCOORD0
		]);
		MeshData.call(this, attributeMap, 8, 12);

		this.rebuild();
	}

	DoubleQuad.prototype = Object.create(MeshData.prototype);
	DoubleQuad.prototype.constructor = DoubleQuad;

	/**
	 * Builds or rebuilds the mesh data.
	 * @returns {DoubleQuad} Self for chaining.
	 */
	DoubleQuad.prototype.rebuild = function () {
		var xExtent = this.xExtent;
		var yExtent = this.yExtent;
		var tileX = this.tileX;
		var tileY = this.tileY;

		this.getAttributeBuffer(MeshData.POSITION).set([
			-xExtent, -yExtent, 0,   -xExtent, yExtent, 0,   xExtent, yExtent, 0,   xExtent, -yExtent, 0,
			-xExtent, -yExtent, 0,   -xExtent, yExtent, 0,   xExtent, yExtent, 0,   xExtent, -yExtent, 0
		]);
		this.getAttributeBuffer(MeshData.NORMAL).set([
			0, 0,  1,   0, 0,  1,   0, 0,  1,   0, 0,  1,
			0, 0, -1,   0, 0, -1,   0, 0, -1,   0, 0, -1
		]);
		this.getAttributeBuffer(MeshData.TEXCOORD0).set([
			0, 0,   0, tileY,   tileX, tileY,   tileX, 0,
			0, 0,   0, tileY,   tileX, tileY,   tileX, 0
		]);

		this.getIndexBuffer().set([
			0, 3, 1,   1, 3, 2,
			7, 4, 5,   7, 5, 6
		]);

		return this;
	};

	return DoubleQuad;
})(goo.MeshData);
goo.QuadComponent = (function (
	Component,
	DoubleQuad,
	MeshDataComponent,
	MeshRendererComponent,
	ShaderLib,
	Material,
	_,
	Texture
) {
	'use strict';

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
		_.defaults(settings, defaults); //! AT: this will mutate settings which is BAD!!!

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

	return QuadComponent;
})(goo.Component,goo.DoubleQuad,goo.MeshDataComponent,goo.MeshRendererComponent,goo.ShaderLib,goo.Material,goo.ObjectUtils,goo.Texture);
goo.QuadComponentHandler = (function (
	ComponentHandler,
	RSVP,
	PromiseUtils,
	_,
	QuadComponent
) {
	'use strict';

	/**
	 * For handling loading of quadcomponents
	 * @param {World} world The goo world
	 * @param {Function} getConfig The config loader function. See {@see DynamicLoader._loadRef}.
	 * @param {Function} updateObject The handler function. See {@see DynamicLoader.update}.
	 * @extends ComponentHandler
	 * @hidden
	 */
	function QuadComponentHandler() {
		ComponentHandler.apply(this, arguments);
		this._type = 'QuadComponent';
	}

	QuadComponentHandler.prototype = Object.create(ComponentHandler.prototype);
	QuadComponentHandler.prototype.constructor = QuadComponentHandler;
	ComponentHandler._registerClass('quad', QuadComponentHandler);

	/**
	 * Create a quadcomponent object.
	 * @returns {QuadComponent} the created component object
	 * @private
	 */
	QuadComponentHandler.prototype._create = function () {
		return new QuadComponent();
	};

	/**
	 * Removes the quadcomponent from the entity.
	 * @param {Entity} entity
	 * @private
	 */
	QuadComponentHandler.prototype._remove = function (entity) {
		if (this.world && this.world.gooRunner) {
			entity.quadComponent.destroy(this.world.gooRunner.renderer.context);
		}
		entity.clearComponent('quadComponent');
	};

	/**
	 * Update engine quadcomponent object based on the config.
	 * @param {Entity} entity The entity on which this component should be added.
	 * @param {Object} config
	 * @param {Object} options
	 * @returns {RSVP.Promise} promise that resolves with the component when loading is done.
	 */
	QuadComponentHandler.prototype.update = function (entity, config, options) {
		var that = this;
		return ComponentHandler.prototype.update.call(this, entity, config, options).then(function (component) {
			if (!component) { return; }

			// Load material
			return that._load(config.materialRef, options).then(function (material) {
				// setting this here until the frontend sends good values
				material.cullState.enabled = true;

				// If the component already has got these components, they need to be overridden
				if (entity.meshRendererComponent !== component.meshRendererComponent) {
					entity.setComponent(component.meshRendererComponent);
				}
				if (entity.meshDataComponent !== component.meshDataComponent) {
					entity.setComponent(component.meshDataComponent);
				}

				component.setMaterial(material);
				component.rebuildMeshData();
				component.meshDataComponent.autoCompute = true;

				return component;
			});
		});
	};

	return QuadComponentHandler;
})(goo.ComponentHandler,goo.rsvp,goo.PromiseUtils,goo.ObjectUtils,goo.QuadComponent);
if (typeof require === "function") {
define("goo/quadpack/DoubleQuad", [], function () { return goo.DoubleQuad; });
define("goo/quadpack/QuadComponent", [], function () { return goo.QuadComponent; });
define("goo/quadpack/QuadComponentHandler", [], function () { return goo.QuadComponentHandler; });
}
