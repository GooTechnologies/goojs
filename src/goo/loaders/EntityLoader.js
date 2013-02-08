/* jshint bitwise: false */
define([
		'goo/entities/Entity',
		'goo/renderer/Camera',
		'goo/entities/components/CameraComponent',
		'goo/entities/components/TransformComponent',
		'goo/entities/components/MeshRendererComponent',
		'goo/entities/components/MeshDataComponent',
		'goo/math/Vector3',

		'goo/util/Promise',
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

		Promise,
		Ajax,

		MaterialLoader,
		MeshLoader
	) {
	"use strict";

	/*
	 *
	 */
	function EntityLoader(world, rootUrl) {
		this._rootUrl = rootUrl || '';
		this._world = (typeof world !== "undefined" && world !== null) ? world : null;
	}

	// REVIEW: Do we need the setRootUrl function?
	// Isn't it more reasonable to create a new EntityLoader instance in that case?
	// Trying to keep code simple and objects immutable.
	EntityLoader.prototype.setRootUrl = function(rootUrl) {
		if(typeof rootUrl === 'undefined' || rootUrl === null) { return this; }
		this._rootUrl = rootUrl;

		return this;
	};

	// REVIEW: Do we need the setWorld function? What's the purpose?
	EntityLoader.prototype.setWorld = function(world) {
		if(typeof world === "undefined" && world === null) { return this; }
		this._world = world;

		return this;
	};

	// REVIEW: Missing documentation. What is sourcePath? What is the return value?
	EntityLoader.prototype.load = function(sourcePath) {
		var promise = new Promise();
		// REVIEW: Methods beginning with underscore are private. Don't call a private method. Make it public if you're supposed to call it.
		//         (Applies to all calls to promise._*)
		if(typeof this._world === "undefined" || this._world === null) { promise._reject('World was undefined/null'); }
		if(typeof sourcePath === 'undefined' || sourcePath === null) { promise._reject('URL not specified'); }

		var that = this;

		if(promise._state === 'pending')
		{
			new Ajax({
				url: this._rootUrl + sourcePath // It's gotta be a json object!
			})
			.done(function(request) {
				that._parseEntity(that._handleRequest(request))
					.done(function(data) {
						promise._resolve(data);
					})
					.fail(function(data) {
						// REVIEW: Methods beginning with underscore are private. Don't call a private method.
						promise._reject(data);
					});
			})
			.fail(function(data) {
				promise._reject(data.responseText);
			});
		}

		return promise;
	};

	EntityLoader.prototype._handleRequest = function(request) {
		var json = null;

		if(request && request.getResponseHeader('Content-Type') === 'application/json')
		{
			try
			{
				json = JSON.parse(request.responseText);
			}
			catch (e)
			{
				console.warn('Couldn\'t load following data to JSON:\n' + request.responseText);
			}
		}

		return json;
	};

	EntityLoader.prototype._parseEntity = function(entitySource) {
		var promise = new Promise(),
			promises = {}, // Keep track of promises
			loadedComponents = [], // Array containing loaded components
			that = this;

		if(entitySource && Object.keys(entitySource.components).length)
		{
			var component;

			for(var type in entitySource.components || [])
			{
				component = entitySource.components[type];

				if(type === 'transform')
				{
					// Create a transform
					var tc = new TransformComponent();

					tc.transform.translation = new Vector3(component.translation);
					tc.transform.scale		 = new Vector3(component.scale);
					
					tc.transform.rotation.fromAngles(
						component.rotation[0],
						component.rotation[1],
						component.rotation[2]);

					loadedComponents.push(tc);
				}
				else if(type === 'camera')
				{
					// Create a camera
					var cam = new Camera(
						component.fov		? component.fov		: 45,
						component.aspect	? component.aspect	: 1,
						component.near		? component.near	: 1,
						component.far		? component.far		: 100);

					var cc = new CameraComponent(cam);

					loadedComponents.push(cc);
				}
				else if(type === 'meshRenderer')
				{
					for(var attribute in component)
					{
						var materialsPromises = [];
						if(attribute === 'materials')
						{
							for(var i in component[attribute])
							{
								materialsPromises.push(new MaterialLoader(this._rootUrl).load(component[attribute][i] + '.json'));
							}
						}

						// When all materials have been loaded
						promises.meshRenderer = Promise.when.apply(this, materialsPromises)
							.done(function(materials) {
								
								var mrc = new MeshRendererComponent();
								for(var i in materials) { mrc.materials.push(materials[i]); }
								
								loadedComponents.push(mrc);
							})
							.fail(function(data) {
								promise._reject(data);
							});
					}
				}
				else if(type === 'meshData')
				{
					for(var attribute in component)
					{
						var meshDataPromises = {};
						if(attribute === 'mesh')
						{
							meshDataPromises.mesh = new MeshLoader(this._rootUrl).load(component[attribute] + '.json');
						}

						// When the mesh is loaded
						promises.meshData = Promise.when(meshDataPromises.mesh)
							.done(function(data) {

								var mrc = new MeshDataComponent(data[0]);
								
								loadedComponents.push(mrc);
							})
							.fail(function(data) {
								promise._reject(data);
							});
					}
				}
			}
		}
		else
		{
			promise._reject('Couldn\'t load entity from source: ' + entitySource);
		}

		// When all promises are processed we want to
		// either create an entity or return an error
		Promise.when(promises.meshRenderer, promises.meshData)
			.done(function(components) {

				var entity = new Entity(that._world);
				
				for(var i in loadedComponents)
				{
					if(loadedComponents[i].type === 'TransformComponent')
					{
						entity.clearComponent('transformComponent');
					}

					entity.setComponent(loadedComponents[i]);
				}
				
				promise._resolve(entity);
			})
			.fail(function(data) {
				promise._reject(data);
			});

		return promise;
	};

	return EntityLoader;
});