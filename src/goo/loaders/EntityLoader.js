/* jshint bitwise: false */

define([
		'goo/entities/Entity',
		'goo/renderer/Camera',
		'goo/entities/components/CameraComponent',
		'goo/entities/components/TransformComponent',
		'goo/entities/components/MeshRendererComponent',
		'goo/entities/components/MeshDataComponent',
		'goo/math/Vector3',

		'goo/util/Deferred',
		'goo/util/Ajax',

		'goo/loaders/MaterialLoader',
		'goo/loaders/MeshLoader',
		'goo/loaders/Loader'
	],
/** @lends EntityLoader */
function(
		Entity,
		Camera,
		CameraComponent,
		TransformComponent,
		MeshRendererComponent,
		MeshDataComponent,
		Vector3,

		Deferred,
		Ajax,

		MaterialLoader,
		MeshLoader,
		Loader
	) {
	"use strict";

	/**
	 * Utility class for loading an entities into a World.
	 *
	 * @constructor
	 * @param {World} parameters.world The target World object.
	 * @param {Loader} parameters.loader
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
	}

	/**
	 * Loads the entity at <code>entityPath</code>.
	 *
	 * @param {string} entityPath Relative path to the entity.
	 * @return {Promise} The promise is resolved with the loaded Entity object.
	 */
	EntityLoader.prototype.load = function(entityPath) {
		var that = this;
		return this._loader.load(entityPath, function(data) {
			return that._parse(data);
		});
	};


	EntityLoader.prototype._parse = function(entitySource) {
		var deferred = new Deferred();
		var promises = {}; // Keep track of promises
		var loadedComponents = []; // Array containing loaded components
		var that = this;

		if(entitySource && Object.keys(entitySource.components).length) {
			var component;

			for(var type in entitySource.components || []) {
				component = entitySource.components[type];

				if(type === 'transform') {
					loadedComponents.push(this._getTransformComponent(component));

				} else if(type === 'camera') {
					loadedComponents.push(this._getCameraComponent(component));

				} else if(type === 'meshRenderer') {
					promises[type] = this._getMeshRendererComponent(component)
					.done(function(meshRendererComponent) {
						loadedComponents.push(meshRendererComponent);
					})
					.fail(function(message) {
						deferred.reject(message);
					});

				} else if(type === 'meshData') {
					promises[type] = this._getMeshDataComponent(component)
					.done(function(meshRendererComponent) {
						loadedComponents.push(meshRendererComponent);
					})
					.fail(function(message) {
						deferred.reject(message);
					});

				}
			}
		} else {
			deferred.reject('Couldn\'t load entity from source: ' + entitySource);
		}

		// When all promises are processed we want to
		// either create an entity or return an error
		Deferred.when(promises.meshRenderer, promises.meshData)
		.done(function(components) {

			var entity = new Entity(that._world);
			
			for(var i in loadedComponents) {
				if(loadedComponents[i].type === 'TransformComponent') {
					entity.clearComponent('transformComponent');
				}

				entity.setComponent(loadedComponents[i]);
			}
			
			deferred.resolve(entity);
		})
		.fail(function(data) {
			deferred.reject(data);
		});

		return deferred.promise();
	};

	EntityLoader.prototype._getTransformComponent = function(transformComponentSource) {
		// Create a transform
		var tc = new TransformComponent();

		tc.transform.translation = new Vector3(transformComponentSource.translation);
		tc.transform.scale = new Vector3(transformComponentSource.scale);
		
		tc.transform.rotation.fromAngles(
			transformComponentSource.rotation[0],
			transformComponentSource.rotation[1],
			transformComponentSource.rotation[2]);

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

	EntityLoader.prototype._getMeshRendererComponent = function(meshRendererComponentSource) {
		var deferred = new Deferred();

		for(var attribute in meshRendererComponentSource) {
			var materialsPromises = [];
			if(attribute === 'materials') {
				for(var i in meshRendererComponentSource[attribute]) {
					materialsPromises.push(new MaterialLoader({ loader: this._loader }).load(meshRendererComponentSource[attribute][i]));
				}
			}

			// When all materials have been loaded
			Deferred.when.apply(this, materialsPromises)
			.done(function(materials) {
				
				var mrc = new MeshRendererComponent();
				for(var i in materials) {
					mrc.materials.push(materials[i]);
				}
				
				deferred.resolve(mrc);
			})
			.fail(function(data) {
				deferred.reject(data);
			});
		}

		return deferred.promise();
	};

	EntityLoader.prototype._getMeshDataComponent = function(meshDataComponentSource) {
		var deferred = new Deferred();

		for(var attribute in meshDataComponentSource) {
			var meshDataPromises = {};
			if(attribute === 'mesh') {
				meshDataPromises.mesh = new MeshLoader({ loader: this._loader }).load(meshDataComponentSource[attribute]);
			}

			// When the mesh is loaded
			Deferred.when(meshDataPromises.mesh)
			.done(function(data) {
				
				// We placed the meshDataPromise first so it's at index 0 
				var mdc = new MeshDataComponent(data[0]);
				
				deferred.resolve(mdc);
			})
			.fail(function(message) {
				deferred.reject(message);
			});
		}

		return deferred.promise();
	};


	return EntityLoader;
});