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
		'goo/loaders/MeshLoader'
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
		MeshLoader
	) {
	"use strict";

	/*
	 *
	 */
	function EntityLoader(parameters) {
		this._loader = new Loader(parameters);
		
		if(typeof parameters.world !== "undefined" && parameters.world !== null) {
			this._world;
		} else {
			throw new Error('SceneLoader(): Argument `parameters.world` was undefined/null');
		}
	}

	// REVIEW: Missing documentation. What is sourcePath? What is the return value?
	EntityLoader.prototype.load = function(entityPath) {
		var deferred = new Deferred();
		var that = this;
		
		this._loader.load(entityPath)
		.done(function(entitySource) {

			that._parseScene(entitySource)
			.done(function(entity) {
				deferred.resolve(entity);
			})
			.fail(function(message) {
				deferred.reject(message);
			});

		})
		.fail(function(message) {
			deferred.reject(message);
		});

		return deferred.promise();
	};


	EntityLoader.prototype._parseEntity = function(entitySource) {
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
					
				} else if(type === 'meshData') {
					
				}
			}
		} else {
			deferred.reject('Couldn\'t load entity from source: ' + entitySource);
		}

		// When all promises are processed we want to
		// either create an entity or return an error
		new Deferred.when(promises.meshRenderer, promises.meshData)
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
			component.fov || 45,
			component.aspect || 1,
			component.near || 1,
			component.far || 100);

		return new CameraComponent(cam);
	};

	EntityLoader.prototype._getMeshRendererComponent = function(first_argument) {
		var deferred = new Deferred();

		for(var attribute in component) {
			var materialsPromises = [];
			if(attribute === 'materials') {
				for(var i in component[attribute]) {
					materialsPromises.push(new MaterialLoader(this._rootUrl).load(component[attribute][i]));
				}
			}

			// When all materials have been loaded
			promises.meshRenderer = new Deferred.when.apply(this, materialsPromises)
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

	EntityLoader.prototype._getMeshComponent = function(first_argument) {
		var deferred = new Deferred();

		for(var attribute in component) {
			var meshDataPromises = {};
			if(attribute === 'mesh') {
				meshDataPromises.mesh = new MeshLoader(this._rootUrl).load(component[attribute]);
			}

			// When the mesh is loaded
			promises.meshData = new Deferred.when(meshDataPromises.mesh)
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