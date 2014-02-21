define([
	'goo/loaders/handlers/ConfigHandler'

],
/** @lends */
function(
	ConfigHandler
) {
	"use strict";

	/*jshint eqeqeq: false, -W041 */
	/**
	 * @class Handler for loading project into engine (actually loading mainScene)
	 * @private
	 * @extends ConfigHandler
	 * @param {World} world
	 * @param {Function} getConfig
	 * @param {Function} updateObject
	 */
	function ProjectHandler() {
		ConfigHandler.apply(this, arguments);
		/**
		this._skybox = null;
		this._skyboxTexture = null;
		this._skyboxGeographic = false;

		this._composer = null;
		this._passes = [];
		this.weatherState = {};
		*/
	}

	ProjectHandler.prototype = Object.create(ConfigHandler.prototype);
	ProjectHandler.prototype.constructor = ProjectHandler;
	ConfigHandler._registerClass('project', ProjectHandler);

	/**
	 * Removes project from engine, i e removes mainScene, i e removes scene entities from world
	 * @param {string} ref}
	 * @param {object} options
	 */
	ProjectHandler.prototype._remove = function(ref, options) {
		var project = this._objects[ref];
		if (project) {
			this.updateObject(project.mainScene.id, null, options);
		}
	};

	/**
	 * Creates an empty project object
	 * @returns {object}
	 * @private
	 */
	ProjectHandler.prototype._create = function() {
		return {
			mainScene: null
		};
	};

	/**
	 * Creates/updates/removes a project
	 * @param {string} ref
	 * @param {object|null} config
	 * @param {object} options
	 * @returns {RSVP.Promise} Resolves with the updated scene or null if removed
	 */
	 ProjectHandler.prototype.update = function(ref, config, options) {
		var that = this;
		return ConfigHandler.prototype.update.call(this, ref, config, options).then(function(project) {
			if (!project) { return; }
			function loadPromise() {
				return that._load(config.mainSceneRef, options).then(function(scene) {
					project.mainScene = scene;
					return project;
				});
			}

			if (project.mainScene && config.mainSceneRef !== project.mainScene.id) {
				return that.updateObject(project.mainScene.id, null, options).then(loadPromise);
			} else {
				return loadPromise();
			}
		});
	};

	return ProjectHandler;

	/**Save for copy pasting into other handlers

	ProjectHandler.prototype._prepare = function(config) {
		config.skybox = config.skybox || {};
		_.defaults(config.skybox, {
			shape: 'Box',
			imageUrls: ['','','','','',''],
			rotation: 0,
			environmentType: 1
		});
		config.backgroundColor = config.backgroundColor || [0.75,0.76,0.78,1];
		config.globalAmbient = config.globalAmbient || [0, 0, 0];
		config.useFog = config.useFog || false;
		config.fogColor = config.fogColor || [1, 1, 1];
		config.fogNear = config.fogNear || 0;
		config.fogFar = config.fogFar==null? 1000: config.fogFar;
	};

	ProjectHandler.prototype._create = function(/*ref*) {};

	ProjectHandler.prototype._createSkybox = function(goo, shape, textures, rotation, mapping) {
		var mapping = mapping ? Sphere.TextureModes.Projected : Sphere.TextureModes.Chromeball;
		var skybox = new Skybox(shape, [], mapping, rotation);
		var skyboxEntity = this._skybox = EntityUtils.createTypicalEntity(goo.world, skybox.meshData, skybox.materials[0], skybox.transform);
		skyboxEntity.name = 'Skybox_'+shape;
		skyboxEntity.isSkybox = true;
		skyboxEntity.transformComponent.updateWorldTransform();
		skyboxEntity.meshRendererComponent.hidden = true;
		goo.world.getSystem('RenderSystem').added(skyboxEntity);
	};

	ProjectHandler.prototype._updateSkybox = function(skyboxConfig, options) {
		if (skyboxConfig) {
			var shape = skyboxConfig.shape.toLowerCase();
			var rotation = skyboxConfig.rotation * MathUtils.DEG_TO_RAD;
			var imageUrls = skyboxConfig.imageUrls;
			var type = (this._skybox) ? this._skybox.name.split('_')[1] : null;
			if (!shape || type !== shape || type === 'sphere' && skyboxConfig.environmentType !== this._skyboxGeographic) {
				if(this._skybox) {
					this.world.getSystem('RenderSystem').removed(this._skybox);
				}
				this._createSkybox(this.world.gooRunner, shape, imageUrls, rotation, skyboxConfig.environmentType);
				this._skyboxTexture = null;
				type = shape;
				this._skyboxGeographic = skyboxConfig.environmentType;
			}
			var xAngle = 0;
			if (type === Skybox.SPHERE) {
				xAngle = (skyboxConfig.environmentType) ? Math.PI / 2 : Math.PI;
			}
			this._skybox.transformComponent.transform.rotation.fromAngles(xAngle, rotation, 0);
			this._skybox.transformComponent.updateTransform();
			this._skybox.transformComponent.updateWorldTransform();

			var skybox = this._skybox;
			var material = skybox.meshRendererComponent.materials[0];
			var texture = this._skyboxTexture;

			var update = !texture; // New load or skybox shape changed
			if(!update && options && options.skybox && options.skybox.reload) {
				update = true;
			}
			if(!update) {

				// Same shape, just maybe some new images
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

			//Hacky
			ShaderBuilder.ENVIRONMENT_TYPE = skyboxConfig.environmentType ? 1 : 0;

			if(!update) { return PromiseUtil.createDummyPromise(); }

			var promises = [];
			for (var i = 0; i < imageUrls.length; i++) {
				if(imageUrls[i] && imageUrls[i] !== '') {
					promises.push(this.getConfig(imageUrls[i]));
				}
			}
			if (!promises.length) {
				skybox.meshRendererComponent.hidden = true;
				material.setTexture('DIFFUSE_MAP', null);
				ShaderBuilder.SKYBOX = null;
				ShaderBuilder.SKYSPHERE = null;
				return PromiseUtil.createDummyPromise();
			}
			var that = this;
			return RSVP.all(promises).then(function(images) {
					var clearSkybox = function() {
						skybox.meshRendererComponent.hidden = true;
						material.setTexture('DIFFUSE_MAP', null);
						ShaderBuilder.SKYBOX = null;
						ShaderBuilder.SKYSPHERE = null;
					};
					if (type === Skybox.SPHERE) {
						if (imageUrls[0] === '') {
							SystemBus.emit('goo.error.skybox', {
								type: 'Sphere',
								message: 'The skysphere needs an image to display.'
							});
							ShaderBuilder.SKYBOX = null;
							ShaderBuilder.SKYSPHERE = null;
							return;
						}
						images = images[0];
						images.setAttribute('data-ref', imageUrls[0]);
					} else {
						if (images[0] === '') {
							SystemBus.emit('goo.error.skybox', {
								type: 'Box',
								message: 'The skybox needs an image to display.'
							});
							clearSkybox();
							return;
						}
						var w = images[0].width;
						var h = images[0].height;
						for (var i = 0; i < 6; i++) {
							var img = images[i] = images[i] || images[0];
							if (img.width !== img.height) {
								SystemBus.emit('goo.error.skybox', {
									type: 'Box',
									message: 'The skybox needs square images to display'
								});
								clearSkybox();
								return;
							}
							if (w !== img.width || h !== img.height) {
								SystemBus.emit('goo.error.skybox', {
									type: 'Box',
									message: 'The skybox needs six images of the same size to display'
								});
								clearSkybox();
								return;
							}
							img.setAttribute('data-ref', imageUrls[i]);
						}
					}
					if (!texture) {
						texture = that._skyboxTexture = new Texture(null, {flipY: false });
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

						if (type === Skybox.BOX) {
							ShaderBuilder.SKYBOX = texture;
							ShaderBuilder.SKYSPHERE = null;
						} else {
							ShaderBuilder.SKYBOX = null;
							ShaderBuilder.SKYSPHERE = texture;
							ShaderBuilder.ENVIRONMENT_TYPE = skyboxConfig.environmentType ? 1 : 0;
						}

						skybox.meshRendererComponent.hidden = false;

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
					if (
						// beforeAdd returns true (or is not defined)
						(that.options.beforeAdd == null ||
							that.options.beforeAdd.apply == null ||
							that.options.beforeAdd(entity)) &&

						// Entity is not already in the scene
						!(that.world.entityManager.containsEntity(entity) ||
							that.world._addedEntities.filter(function(e) {
								return e.id === entity.id;
						}).length > 0)) {
						//console.log("Adding " + entity.name + " to world");
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
		var mainRenderSystem = that.world.getSystem('RenderSystem');
		if (config.posteffectRefs && Array.isArray(config.posteffectRefs) && config.posteffectRefs.length > 0) {
			var handlePosteffectRef = function(posteffectRef) {
				return that.getConfig(posteffectRef).then(function(posteffectConfig) {
					return that.updateObject(posteffectRef, posteffectConfig, that.options);
				});
			};

			for (var i = 0; i < config.posteffectRefs.length; i++) {
				if(config.posteffectRefs[i]) {
					promises.push(handlePosteffectRef(config.posteffectRefs[i]));
				}
			}

			return RSVP.all(promises).then(function(posteffects) {
				var enabled = false;
				for (var j = 0; j < posteffects.length; j++) {
					if (!posteffects[j]) {
						continue;
					}
					var posteffect = posteffects[j];
					if (posteffect.enabled && !enabled) {
						enabled = true;
					}
				}

				if (enabled) {
					var composer, renderPass, outPass;
					if(!that._composer) {
						composer = that._composer = new Composer();
						//mainRenderSystem.composers.push(composer);
						renderPass = new RenderPass(mainRenderSystem.renderList);
						//renderPass.clearColor = new Vector4(0, 0, 0, 0);
						// Regular copy
						var outPass = new FullscreenPass(Util.clone(ShaderLib.copy));
						//outPass.material.blendState.blending = 'CustomBlending';
						outPass.renderToScreen = true;
						//outPass.clear = { color: false, depth: true, stencil: true };
						//outPass.clear = true;
					} else {
						composer = that._composer;
						renderPass = composer.passes[0];
						outPass = composer.passes[composer.passes.length - 1];
					}
					composer.passes = [];
					composer.addPass(renderPass);
					for (var j = 0; j < posteffects.length; j++) {
						if (!posteffects[j]) {
							continue;
						}
						var posteffect = posteffects[j];
						if (posteffect.enabled) {
							composer.addPass(posteffect);
						}
					}
					composer.addPass(outPass);

					if (mainRenderSystem.composers.indexOf(composer) === -1) {
						mainRenderSystem.composers.push(composer);
					}
				} else {
					if (that._composer) {
						ArrayUtil.remove(mainRenderSystem.composers, that._composer);
					}
				}
			}).then(null, function(err) {
				return console.error("Error updating posteffects: " + err);
			});
		} else {
			mainRenderSystem.composers.length = 0;
			return PromiseUtil.createDummyPromise(config);
		}
	};

	ProjectHandler.weatherHandlers = {
		snow: {
			update: function(config, weatherState) {
				if (config.enabled) {
					if (weatherState.snow && weatherState.snow.enabled) {
						// adjust snow
						weatherState.snow.snow.setEmissionVelocity(config.velocity);
						weatherState.snow.snow.setReleaseRatePerSecond(config.rate);
						weatherState.snow.snow.setEmissionHeight(config.height);
					} else {
						// add snow
						weatherState.snow = weatherState.snow || {};
						weatherState.snow.enabled = true;
						weatherState.snow.snow = new Snow(this.world.gooRunner);
					}
				} else {
					if (weatherState.snow && weatherState.snow.enabled) {
						// remove snow
						weatherState.snow.snow.remove();
						weatherState.snow.enabled = false;
						delete weatherState.snow.snow;
					} else {
						// do nothing
					}
				}
			},
			remove: function(weatherState) {
				if (weatherState.snow.snow) {
					weatherState.snow.snow.remove();
					weatherState.snow.enabled = false;
					delete weatherState.snow.snow;
				}
			}
		}
	};

	ProjectHandler.prototype._updateWeather = function(config) {
		// update
		for (var key in config) {
			ProjectHandler.weatherHandlers[key].update.bind(this)(config[key], this.weatherState);
		}

		// cleanup whatever magically made it into weather state and avoided the above update loop
		/**
		for (var key in this.weatherState) {
			if (!config[key]) {
				ProjectHandler.weatherHandlers[key].remove.bind(this)(this.weatherState);
			}
		}
		*
	};

	ProjectHandler.prototype._removeWeather = function() {
	    for (var key in this.weatherState) {
			ProjectHandler.weatherHandlers[key].remove.bind(this)(this.weatherState);
		}
	};

	// Returns a promise which resolves when updating is done
	ProjectHandler.prototype.update = function(ref, config, options) {
		var that = this;
		this._prepare(config);
		var promises = [];

		// skybox
		promises.push(this._updateSkybox(config.skybox, options));

		// entity refs
		if (!options || !options.shallow) {
			promises.push(this._updateEntities(config));
		}

		// posteffect refs
		promises.push(this._updatePosteffects(config));

		// REVIEW: This is asynchronous, for consistency the returned promise should not resolve until it's done
		// weather
		if (config.weather) {
			// the config.weather might be empty and weather might not exist in which case it doesn't get removed
			this._updateWeather(config.weather);
		} else {
			this._removeWeather();
		}

		return RSVP.all(promises).then(function(results) {
			var renderer = that.world.gooRunner.renderer;
			renderer.setClearColor.apply(renderer, config.backgroundColor);
			if (that._composer) {
				that._composer.setClearColor(config.backgroundColor);
			}

			ShaderBuilder.GLOBAL_AMBIENT = config.globalAmbient;

			ShaderBuilder.USE_FOG = config.useFog;
			ShaderBuilder.FOG_SETTINGS = [config.fogNear, config.fogFar];
			ShaderBuilder.FOG_COLOR = config.fogColor;

			return results;
		});
	};

	ProjectHandler.prototype.remove = function(/*ref/) {
		if (this._skybox) {
			this.world.getSystem('RenderSystem').removed(this._skybox);
		}
		this._skybox = null;
		this._skyboxTexture = null;
		this._skyboxGeographic = false;

		this._composer = null;
		this._passes = [];
	};
	*/
});
