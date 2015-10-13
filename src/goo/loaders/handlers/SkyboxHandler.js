define([
	'goo/entities/SystemBus',
	'goo/loaders/handlers/ConfigHandler',
	'goo/loaders/handlers/EnvironmentHandler',
	'goo/renderer/shaders/ShaderBuilder',
	'goo/renderer/Texture',
	'goo/util/PromiseUtils',
	'goo/util/Skybox'
], function (
	SystemBus,
	ConfigHandler,
	EnvironmentHandler,
	ShaderBuilder,
	Texture,
	PromiseUtils,
	Skybox
) {
	'use strict';

	function SkyboxHandler() {
		ConfigHandler.apply(this, arguments);

		// Skybox entity
		var skybox = new Skybox('box', [], null, 0);
		this._skybox = this.world.createEntity(skybox.meshData, skybox.materials[0], skybox.transform);
		this._skybox.transformComponent.updateWorldTransform();
		this._skybox.isSkybox = true;
		this._skybox.name = 'Skybox_box';

		// Skybox texture
		this._skyboxTexture = new Texture(null, { flipY: false });
		this._skyboxTexture.variant = 'CUBE';
		this._skyboxTexture.wrapS = 'EdgeClamp';
		this._skyboxTexture.wrapT = 'EdgeClamp';
		this._skybox.meshRendererComponent.materials[0].setTexture('DIFFUSE_MAP', this._skyboxTexture);

		// Skysphere entity
		var skysphere = new Skybox('sphere', [], null, 0);
		this._skysphere = this.world.createEntity(skysphere.meshData, skysphere.materials[0], skysphere.transform);
		this._skysphere.transformComponent.updateWorldTransform();
		this._skysphere.isSkybox = true;
		this._skysphere.name = 'Skybox_sphere';

		// Skysphere texture
		this._skysphereTexture = new Texture(null, { flipY: false, wrapS: 'EdgeClamp', wrapT: 'EdgeClamp' });
		this._skysphere.meshRendererComponent.materials[0].setTexture('DIFFUSE_MAP', this._skysphereTexture);

		this._activeSkyshape = null;
	}

	SkyboxHandler.prototype = Object.create(ConfigHandler.prototype);
	SkyboxHandler.prototype.constructor = SkyboxHandler;
	ConfigHandler._registerClass('skybox', SkyboxHandler);

	SkyboxHandler.prototype._remove = function (ref) {
		this._objects.delete(ref);
		this._skyboxTexture.setImage(null);
		this._hide();
	};

	SkyboxHandler.prototype._create = function () {
		return {
			textures: [],
			enabled: false
		};
	};

	SkyboxHandler.prototype._update = function (ref, config, options) {
		// Only update the skybox which is loaded by the environment.
		if (EnvironmentHandler.currentSkyboxRef !== ref) {
			return PromiseUtils.resolve([]);
		}

		return ConfigHandler.prototype._update.call(this, ref, config, options)
		.then(function (skybox) {
			if (!skybox) {
				this._hide();
				return PromiseUtils.resolve([]);
			}

			this._updateBoxOrSphere(ref, config, options, skybox)
			.then(this._show.bind(this));
		}.bind(this));
	};

	SkyboxHandler.prototype._updateBoxOrSphere = function (ref, config, options, skybox) {
		if (config.box && config.box.enabled) {
			return this._updateBox(ref, config.box, options, skybox);
		} else if (config.sphere && config.sphere.enabled) {
			return this._updateSphere(ref, config.sphere, options, skybox);
		}
	};

	SkyboxHandler.prototype._updateSphere = function (ref, config, options, skybox) {
		if (!config) { return PromiseUtils.resolve(); }

		if (config.sphereRef) {
			return this._load(config.sphereRef, options)
			.then(function (texture) {
				if (!texture || !texture.image) {
					SystemBus.emit('goo.error.skybox', {
						type: 'Sphere',
						message: 'The skysphere needs an image to display.'
					});
					return;
				}

				var skyTex = this._skysphereTexture;
				skybox.textures = [texture];
				skyTex.setImage(texture.image);

				return this._skysphere;
			}.bind(this));
		} else {
			this._skysphereTexture.setImage(null);
			return PromiseUtils.resolve(this._skysphere);
		}
	};

	SkyboxHandler.prototype._updateBox = function (ref, config, options, skybox) {
		if (!config) { return PromiseUtils.resolve(); }

		return this._loadSideTextures(config, options)
		.then(function (textures) {
			var images = textures
				.map(function (tex) { return tex ? tex.image : null; })
				.filter(Boolean);

			if (images.length > 0) {
				skybox.textures = textures;
				var skyTex = this._skyboxTexture;
				skyTex.setImage(images);
				skyTex.image.dataReady = true;

				var maxSize = getMaxSize(images);
				skyTex.image.width = maxSize.width;
				skyTex.image.height = maxSize.height;

				skyTex.setNeedsUpdate();
			} else {
				this._skyboxTexture.setImage(null);
			}

			return this._skybox;
		}.bind(this));
	};

	var SIDES = ['rightRef', 'leftRef', 'topRef', 'bottomRef', 'frontRef', 'backRef'];

	SkyboxHandler.prototype._loadSideTextures = function (config, options) {
		var loadSide = (function (side) {
			return config[side] ? this._load(config[side], options) : PromiseUtils.resolve();
		}).bind(this);

		return PromiseUtils.all(SIDES.map(loadSide));
	};

	function getMaxSize(images) {
		var size = {width: 1, height: 1};

		images.forEach(function (image) {
			size.width = Math.max(size.width, image.width);
			size.height = Math.max(size.height, image.width);
		});

		return size;
	}

	SkyboxHandler.prototype._hide = function () {
		if (this._activeSkyshape) {
			this.world.getSystem('RenderSystem').removed(this._activeSkyshape);
		}

		ShaderBuilder.SKYBOX = null;
		ShaderBuilder.SKYSPHERE = null;
	};

	SkyboxHandler.prototype._show = function (skyshape) {
		this._hide();
		this.world.getSystem('RenderSystem').added(skyshape);
		this._activeSkyshape = skyshape;
		ShaderBuilder.SKYBOX = skyshape === this._skybox ? this._skyboxTexture : null;
		ShaderBuilder.SKYSPHERE = skyshape === this._skysphere ? this._skysphereTexture : null;
	};

	return SkyboxHandler;
});