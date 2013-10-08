/* jshint bitwise: false */

define([
		'goo/entities/Entity',
		'goo/entities/components/Camera',
		'goo/entities/components/Camera',
		'goo/entities/components/TransformComponent',
		'goo/entities/components/MeshRenderer',
		'goo/entities/components/MeshData',
		'goo/entities/components/MeshData',
		'goo/math/Vector3',
		'goo/math/MathUtils',
		'goo/renderer/bounds/BoundingBox',

		'goo/util/rsvp',

		'goo/loaders/MaterialLoader',
		'goo/loaders/MeshLoader',
		'goo/loaders/Loader'
	],
/** @lends */
function(
		Entity,
		Camera,
		CameraComponent,
		TransformComponent,
		MeshRenderer,
		MeshDataComponent,
		MeshData,
		Vector3,
		MathUtils,
		BoundingBox,

		RSVP,

		MaterialLoader,
		MeshLoader,
		Loader
	) {
	"use strict";

	/**
	 * @class Utility class for loading an entities into a World.
	 *
	 * @constructor
	 * @param {object} parameters
	 * @param {World} parameters.world The target World object.
	 * @param {Loader} parameters.loader
	 * @param {boolean} parameters.cacheShader Uses same instance of shader for equal shaderRefs. Doesn't work for animated meshes
	 */
	function EntityLoader(parameters) {
		if(typeof parameters === "undefined" || parameters === null) {
			throw new Error('EntityLoader(): Argument `parameters` was undefined/null');
		}

		if(typeof parameters.loader === "undefined" || !(parameters.loader instanceof Loader) || parameters.loader === null) {
			throw new Error('EntityLoader(): Argument `parameters.loader` was invalid/undefined/null');
		}

		if(typeof parameters.world === "undefined" || parameters.world === null) {
			throw new Error('EntityLoader(): Argument `parameters.world` was undefined/null');
		}

		this._loader = parameters.loader;
		this._world = parameters.world;

		this._cache = {};
		this._materialLoader = new MaterialLoader(parameters);
		this._meshLoader = new MeshLoader(parameters);
	}

	/**
	 * Loads the entity at <code>entityRef</code>.
	 * @example
	 * entityLoader.load('entities/entity.ent').then(function(entity) {
	 *   // handle {@link Entity} entity, maybe {@link Entity#addToWorld|entity.addToWorld()}
	 * });
	 * @param {string} entityRef Relative path to the entity.
	 * @return {RSVP.Promise} The promise is resolved with the loaded Entity object.
	 */
	EntityLoader.prototype.load = function(entityRef) {
		if (this._cache[entityRef]) {
			return this._cache[entityRef];
		}
		var promise = this._loader.load(entityRef, function(data) {
			return this._parse(data, entityRef);
		}.bind(this));
		this._cache[entityRef] = promise;
		return promise;
	};


	EntityLoader.prototype._parse = function(entitySource, entityRef) {
		// REVIEW martin: Why this check? Instead make sure config is always an object, not a string
		if (typeof entitySource === 'string') {
			entitySource = JSON.parse(entitySource);
		}
		var promises = []; // Keep track of promises
		var loadedComponents = []; // Array containing loaded components
		var that = this;

		if(entitySource.components) {
			var component;

			component = entitySource.components.transform;
			if(component) {
				loadedComponents.push(this._getTransformComponent(component));
			}

			component = entitySource.components.camera;
			if(component) {
				loadedComponents.push(this._getCameraComponent(component));

			}

			component = entitySource.components.meshRenderer;
			if(component) {
				var p = this._getMeshRenderer(component)
				.then(function(meshRenderer) {
					loadedComponents.push(meshRenderer);
					return meshRenderer;
				});

				promises.push(p);
			}

			component = entitySource.components.meshData;
			if(component) {
				var p = this._getMeshDataComponent(component)
				.then(function(meshDataComponent) {
					loadedComponents.push(meshDataComponent);
					return meshDataComponent;
				});

				promises.push(p);
			}
		}

		if(loadedComponents.length === 0 && promises.length === 0) {
			var p = new RSVP.Promise();
			p.reject('Entity definition `' + entitySource + '` does not seem to contain any components.');
			return p;
		}

		// When all promises are processed we want to
		// either create an entity or return an error
		return RSVP.all(promises)
		.then(function() {
			var entity = new Entity(that._world, entitySource.name || entityRef);
			entity.ref = entityRef;
			for(var i in loadedComponents) {
				if(loadedComponents[i].type === 'TransformComponent') {
					entity.clearComponent('transformComponent');
				}
				entity.setComponent(loadedComponents[i]);
			}

			if (entity.meshDataComponent
			&& entity.meshDataComponent.meshData.type === MeshData.SKINMESH
			&& entity.meshRenderer
			&& entity.meshRenderer.materials.length) {
				var materials = entity.meshRenderer.materials;
				for (var defines, i = 0, max = materials.length; i < max; i++) {
					defines = materials[i].shader.defines;
					if (defines && defines.JOINT_COUNT !== undefined
					&& defines.WEIGHTS !== undefined) {
						defines.JOINT_COUNT = entity.meshDataComponent.meshData.paletteMap.length;
						defines.WEIGHTS = entity.meshDataComponent.meshData.weightsPerVertex;
					}
				}
			}
			return entity;
		});
	};

	/**
	 * Creates a TransformComponent from the given config.
	 * Also loads the entity's parent if any, and sets its child.
	 * @param transformComponentSource Config for the transform component.
	 * @returns {TransformComponent}
	 * @private
	 */
	EntityLoader.prototype._getTransformComponent = function(transformComponentSource) {

		var tc = new TransformComponent();

		tc.transform.translation.set(transformComponentSource.translation);
		tc.transform.scale.set(transformComponentSource.scale);
		tc.transform.rotation.fromAngles(
			MathUtils.radFromDeg(transformComponentSource.rotation[0]),
			MathUtils.radFromDeg(transformComponentSource.rotation[1]),
			MathUtils.radFromDeg(transformComponentSource.rotation[2])
		);

		var parentRef = transformComponentSource.parentRef;
		if (parentRef) {
			this.load(parentRef).then(function (entity) {
				entity.transformComponent.attachChild(tc);
				return entity;
			});
		}

		return tc;
	};

	EntityLoader.prototype._getCameraComponent = function(cameraComponentSource) {
		// Create a camera
		var cam = new Camera(
			cameraComponentSource.fov || 45,
			cameraComponentSource.aspect || 1,
			cameraComponentSource.near || 1,
			cameraComponentSource.far || 100);

		return new CameraComponent(cam);
	};

	EntityLoader.prototype._getMeshRenderer = function(meshRendererSource) {
		var promises = [];
		var ml = this._materialLoader;

		for(var attribute in meshRendererSource) {
			if(attribute === 'materialRefs') {
				for(var i in meshRendererSource[attribute]) {
					var p = ml.load(meshRendererSource[attribute][i]);
					promises.push(p);
				}
			}
		}

		return RSVP.all(promises)
		.then(function(materials) {
			var mrc = new MeshRenderer();
			for(var attribute in meshRendererSource) {
				if (mrc.hasOwnProperty(attribute) && attribute !== 'materials') {
					mrc[attribute] = meshRendererSource[attribute];
				}
			}
			for(var i in materials) {
				mrc.materials.push(materials[i]);
			}
			return mrc;
		});
	};


	EntityLoader.prototype._getMeshDataComponent = function(meshDataComponentSource) {
		var promises = [];
		var mdl = this._meshLoader;
		for(var attribute in meshDataComponentSource) {
			// var meshDataPromises = [];
			if(attribute === 'meshRef') {
				var p = mdl.load(meshDataComponentSource[attribute]);
				promises.push(p);
			}
		}

		// When the mesh is loaded
		return RSVP.all(promises)
		.then(function(data) {
			// We placed the meshDataPromise first so it's at index 0
			var mdc = new MeshDataComponent(data[0]);

			// If boundingbox provided by data, don't calculate automatically
			if (data[0].boundingBox) {
				var min = data[0].boundingBox.min;
				var max = data[0].boundingBox.max;
				var size = [max[0]-min[0], max[1]-min[1], max[2]-min[2]];
				var center = [(max[0]+min[0])*0.5, (max[1]+min[1])*0.5, (max[2]+min[2])*0.5];

				var bounding = new BoundingBox();
				bounding.xExtent = size[0];
				bounding.yExtent = size[1];
				bounding.zExtent = size[2];
				bounding.center.seta(center);
				mdc.modelBound = bounding;
				mdc.autoCompute = false;
			}

			return mdc;
		});
	};


	return EntityLoader;
});