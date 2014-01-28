define([
	'goo/loaders/handlers/ConfigHandler',
	'goo/renderer/Texture',
	'goo/renderer/shaders/ShaderBuilder',
	'goo/util/Skybox',
	'goo/util/rsvp',
	'goo/util/PromiseUtil',
	'goo/entities/SystemBus'
], function(
	ConfigHandler,
	Texture,
	ShaderBuilder,
	Skybox,
	RSVP,
	PromiseUtil,
	SystemBus
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
		this._skyboxTexture = new Texture(null, {flipY: false });
		this._skyboxTexture.variant = 'CUBE';
		this._skybox.meshRendererComponent.materials[0].setTexture('DIFFUSE_MAP', this._skyboxTexture);

		// Skysphere entity
		var skysphere = new Skybox('sphere', [], null, 0);
		this._skysphere = this.world.createEntity(skysphere.meshData, skysphere.materials[0], skysphere.transform);
		this._skysphere.transformComponent.updateWorldTransform();
		this._skysphere.isSkybox = true;
		this._skysphere.name = 'Skybox_sphere';

		// Skysphere texture
		this._skysphereTexture = new Texture(null, { flipY: false });
		this._skysphere.meshRendererComponent.materials[0].setTexture('DIFFUSE_MAP', this._skysphereTexture);

		this._activeSkyshape = null;
	}

	SkyboxHandler.prototype = Object.create(ConfigHandler.prototype);
	SkyboxHandler.prototype.constructor = SkyboxHandler;
	ConfigHandler._registerClass('skybox', SkyboxHandler);

	SkyboxHandler.prototype._remove = function(ref) {
		this.world.getSystem('RenderSystem').removed(this._activeSkyshape);
		this._activeSkyshape = null;
		delete this._objects[ref];
	};

	SkyboxHandler.prototype._create = function() {
		return {
			textures: [],
			enabled: false
		};
	};

	SkyboxHandler.prototype.update = function(ref, config, options) {
		var that = this;
		return ConfigHandler.prototype.update.call(this, ref, config, options).then(function(skybox) {
			if (config.box) {
				that._updateBox(config.box, options, skybox);
			} else if (config.sphere) {
				that._updateSphere(config.sphere, options, skybox);
			}
		});
	};

	SkyboxHandler.prototype._updateSphere = function(config, options, skybox) {
		var that = this;
		if (config.sphereRef) {
			return this._load(config.sphereRef, options).then(function(texture) {
				if (!texture || !texture.image) {
					SystemBus.emit('goo.error.skybox', {
						type: 'Sphere',
						message: 'The skysphere needs an image to display.'
					});
					that._hide();
					return;
				}
				var skyTex = that._skysphereTexture;
				skybox.textures = [texture];
				skyTex.setImage(texture.image);
				skyTex.setNeedsUpdate();
				that._show(that._skysphere, config.enabled);
				return that._skysphere;
			});
		}
	};

	var sides = ['rightRef', 'leftRef', 'topRef', 'bottomRef', 'frontRef', 'backRef'];
	function isEqual(a, b) {
		var len = a.length;
		if (len !== b.length) {
			return false;
		}
		while (len--) {
			if (a[len] !== b[len]) {
				return false;
			}
		}
		return true;
	}

	SkyboxHandler.prototype._updateBox = function(config, options, skybox) {
		var that = this;
		var promises = sides.map(function(side) {
			return config[side] ? that._load(config[side], options) : PromiseUtil.createDummyPromise();
		});

		// Load all textures
		return RSVP.all(promises).then(function(textures) {
			// Check if skybox is the same
			if (isEqual(textures, skybox.textures) && that._activeSkyShape === that._skybox) {
				return that._skybox;
			}

			var images = textures.map(function(texture) { return texture ? texture.image : null; });
			var w, h;
			// Check that images are valid for skybox
			for (var i = 0; i < images.length; i++) {
				var img = images[i] || images[0];
				if (!img) {
					continue;
				}
				// Get first image size
				if (w === undefined) {
					w = img.width;
					h = img.height;
					// Only square images allowed
					if (w !== h) {
						SystemBus.emit('goo.error.skybox', {
							type: 'Box',
							message: 'The skybox needs square images to display'
						});
						that._hide();
						return;
					}
				}
				// Have to be same size
				if (w !== img.width || h !== img.height) {
					SystemBus.emit('goo.error.skybox', {
						type: 'Box',
						message: 'The skybox needs six images of the same size to display'
					});
					that._hide();
					return;
				}
			}
			skybox.textures = textures;
			var skyTex = that._skyboxTexture;
			skyTex.setImage(images);
			skyTex.image.width = w;
			skyTex.image.height = h;
			skyTex.setNeedsUpdate();
			that._show(that._skybox, config.enabled);
			return that._skybox;
		});
	};

	SkyboxHandler.prototype._hide = function() {
		this._show();
	};

	SkyboxHandler.prototype._show = function(skyshape, enabled) {
		if (this._activeSkyshape === skyshape) {
			return;
		}
		var renderSystem = this.world.getSystem('RenderSystem');
		if (this._activeSkyshape) {
			renderSystem.removed(this._activeSkyshape);
		}
		if (skyshape) {
			renderSystem.added(skyshape);
		}
		skyshape.hidden = !!enabled;
		ShaderBuilder.SKYBOX = skyshape === this._skybox ? this._skyboxTexture : null;
		ShaderBuilder.SKYSPHERE = skyshape === this._skysphere ? this._skysphereTexture : null;

		this._activeSkyshape = skyshape;
	};
});