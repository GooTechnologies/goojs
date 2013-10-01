define([
	'goo/loaders/handlers/ConfigHandler',
	'goo/util/rsvp',
	'goo/util/PromiseUtil',
	'goo/util/Skybox',
	'goo/math/MathUtils',
	'goo/shapes/Sphere',
	'goo/renderer/Renderer',
	'goo/renderer/pass/Composer',
	'goo/renderer/pass/RenderPass',
	'goo/math/Vector4',
	'goo/renderer/shaders/ShaderLib',
	'goo/renderer/pass/FullscreenPass',
	'goo/renderer/Util',
	'goo/renderer/Texture',
	'goo/entities/EntityUtils',
	'goo/util/ObjectUtil'
], function(
	ConfigHandler,
	RSVP,
	PromiseUtil,
	Skybox,
	MathUtils,
	Sphere,
	Renderer,
	Composer,
	RenderPass,
	Vector4,
	ShaderLib,
	FullscreenPass,
	Util,
	Texture,
	EntityUtils,
	_
) {
	/*jshint eqeqeq: false, -W041 */
	/**
	 * @class
	 * @constructor
	 */
	function ProjectHandler() {
		ConfigHandler.apply(this, arguments);
		this._skybox = null;
		this._skyboxTexture = null;
	}

	ProjectHandler.prototype = Object.create(ConfigHandler.prototype);
	ConfigHandler._registerClass('project', ProjectHandler);

	ProjectHandler.prototype._prepare = function(config) {
		config.skybox = config.skybox || {};
		_.defaults(config.skybox, {
			shape: 'Box',
			imageUrls: ['','','','','',''],
			rotation: 0
		});
	};

	ProjectHandler.prototype._create = function(/*ref*/) {};

	ProjectHandler.prototype._createSkybox = function(goo, shape, textures, rotation) {
		var skybox = new Skybox(shape, [], Sphere.TextureModes.Projected, rotation);
		var skyboxEntity = this._skybox = EntityUtils.createTypicalEntity(goo.world, skybox.meshData, skybox.materials[0], skybox.transform);
		skyboxEntity.name = 'Skybox_'+shape;
		skyboxEntity.transformComponent.updateWorldTransform();
		skyboxEntity.meshRendererComponent.hidden = true;
		goo.world.getSystem('RenderSystem').added(skyboxEntity);
	};

	ProjectHandler.prototype._updateSkybox = function(skyboxConfig) {
		if (skyboxConfig) {
			var shape = skyboxConfig.shape.toLowerCase();
			var rotation = skyboxConfig.rotation * MathUtils.DEG_TO_RAD;
			var imageUrls = skyboxConfig.imageUrls;
			var type = (this._skybox) ? this._skybox.name.split('_')[1] : null;
			if (!shape || type !== shape) {
				if(this._skybox) {
					this.world.getSystem('RenderSystem').removed(this._skybox);
				}
				this._createSkybox(this.world.gooRunner, shape, imageUrls, rotation);
				this._skyboxTexture = null;
				type = shape;
			}
			var xAngle = (type === Skybox.SPHERE) ? Math.PI / 2 : 0;
			this._skybox.transformComponent.transform.rotation.fromAngles(xAngle, rotation, 0);
			this._skybox.transformComponent.updateTransform();
			this._skybox.transformComponent.updateWorldTransform();

			var skybox = this._skybox;
			var material = skybox.meshRendererComponent.materials[0];
			var texture = this._skyboxTexture;

			var update = !texture;
			if(!update) {
				if (texture.image.data) {
					for (var i = 0; i < imageUrls.length; i++) {
						var img = texture.image.data[i];
						if (img && img.getAttribute('data-ref') !== imageUrls[i]) {
							update = true;
							break;
						}
					}
				} else if (texture.image && texture.image.getAttribute('data-ref') !== imageUrls[0]) {
					update = true;
				}
			}

			if(!update) { return; }

			var promises = [];
			for (var i = 0; i < imageUrls.length; i++) {
				if(imageUrls[i] && imageUrls[i] !== '') {
					promises.push(this.getConfig(imageUrls[i]));
				}
			}
			if (!promises.length) {
				skybox.meshRendererComponent.hidden = true;
				material.setTexture('DIFFUSE_MAP', null);
				return;
			}
			var that = this;
			RSVP.all(promises).then(function(images) {
					if (type === Skybox.SPHERE) {
						if (imageUrls[0] === '') {
							console.debug('Missing front texture');
							return;
						}
						images = images[0];
						images.setAttribute('data-ref', imageUrls[0]);
					} else {
						if (images.length < 6) {
							console.debug('Need 6 images to work, have '+images.length);
							skybox.meshRendererComponent.hidden = true;
							material.setTexture('DIFFUSE_MAP', null);
							return;
						}
						var w = images[0].width;
						var h = images[0].height;
						for (var i = 0; i < 6; i++) {
							var img = images[i];
							if (w !== img.width || h !== img.height) {
								console.error('Images not all the same size, not updating');
								skybox.meshRendererComponent.hidden = true;
								material.setTexture('DIFFUSE_MAP', null);
								return;
							}
							img.setAttribute('data-ref', imageUrls[i]);
						}
					}
					if (!texture) {
						texture = that._skyboxTexture = new Texture();
						if (type === Skybox.BOX) {
							texture.variant = 'CUBE';
						}
					}
					texture.setImage(images);
					if (type === Skybox.BOX && images.length) {
						texture.image.width = images[0].width;
						texture.image.height = images[0].height;
						texture.image.dataReady = true;
					}
					texture.setNeedsUpdate();
					if (type === Skybox.BOX && images.length || images) {
						material.setTexture('DIFFUSE_MAP', texture);
					}
			});
		}
	};

	ProjectHandler.prototype._updateEntities = function(config) {
		var that = this;

		var promises = [];
		if (config.entityRefs && Array.isArray(config.entityRefs) && config.entityRefs.length > 0) {
			var handleEntityRef = function(entityRef) {
				return promises.push(that.getConfig(entityRef).then(function(entityConfig) {
					return that.updateObject(entityRef, entityConfig, that.options);
				}));
			};

			for (var i = 0; i < config.entityRefs.length; i++) {
				handleEntityRef(config.entityRefs[i]);
			}

			return RSVP.all(promises).then(function(entities) {
				for (var j = 0; j < entities.length; j++) {
					var entity = entities[j];
					if ((that.options.beforeAdd == null || that.options.beforeAdd.apply == null || that.options.beforeAdd(entity)) && !that.world.entityManager.containsEntity(entity)) {
						console.log("Adding " + entity.name + " to world");
						entity.addToWorld();
					}
				}
			}).then(null, function(err) {
				return console.error("Error updating entities: " + err);
			});
		} else {
			console.warn("No entity refs in project");
			return PromiseUtil.createDummyPromise(config);
		}
	};

	ProjectHandler.prototype._updatePosteffects = function(config) {
		var that = this;

		var promises = [];
		if (config.posteffectRefs && Array.isArray(config.posteffectRefs) && config.posteffectRefs.length > 0) {
			var handlePosteffectRef = function(posteffectRef) {
				return that.getConfig(posteffectRef).then(function(posteffectConfig) {
					return that.updateObject(posteffectRef, posteffectConfig, that.options);
				});
			};

			for (var i = 0; i < config.posteffectRefs.length; i++) {
				promises.push(handlePosteffectRef(config.posteffectRefs[i]));
			}

			return RSVP.all(promises).then(function(posteffects) {
				var mainRenderSystem = that.world.getSystem('RenderSystem');
				var composer, renderPass, outPass;
				if (mainRenderSystem.composers.length === 0) {
					composer = new Composer();
					mainRenderSystem.composers.push(composer);
					renderPass = new RenderPass(mainRenderSystem.renderList);
					//renderPass.clearColor = new Vector4(0, 0, 0, 0);
					// Regular copy
					var outPass = new FullscreenPass(Util.clone(ShaderLib.copy));
					//outPass.material.blendState.blending = 'CustomBlending';
					outPass.renderToScreen = true;
					//outPass.clear = { color: false, depth: true, stencil: true };
					outPass.clear = true;
				} else {
					composer = mainRenderSystem.composers[0];
					renderPass = composer.passes[0];
					outPass = composer.passes[composer.passes.length - 1];
				}
				composer.passes = [];
				composer.addPass(renderPass);
				for (var j = 0; j < posteffects.length; j++) {
					var posteffect = posteffects[j];
					console.log('Added posteffect', posteffect);
					composer.addPass(posteffect);
				}
				composer.addPass(outPass);
			}).then(null, function(err) {
				return console.error("Error updating posteffects: " + err);
			});
		} else {
			console.debug("No posteffect refs in project");
			return PromiseUtil.createDummyPromise(config);
		}
	};

	// Returns a promise which resolves when updating is done
	ProjectHandler.prototype.update = function(ref, config) {
		this._prepare(config);
		// skybox
		this._updateSkybox(config.skybox);

		// entity refs
		var entitiesPromise = this._updateEntities(config);

		// posteffect refs
		var posteffectsPromise = this._updatePosteffects(config);

		return RSVP.all([entitiesPromise, posteffectsPromise]);
	};

	ProjectHandler.prototype.remove = function(/*ref*/) {};

	return ProjectHandler;

});
