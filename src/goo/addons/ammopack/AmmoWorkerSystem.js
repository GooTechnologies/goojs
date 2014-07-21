define([
	'goo/entities/systems/System',
	'goo/entities/SystemBus',
	'goo/math/Quaternion',
	'goo/math/Vector3',
	'goo/util/rsvp'
],
/** @lends */
function (
	System,
	SystemBus,
	Quaternion,
	Vector3,
	RSVP
) {
	'use strict';

	/**
	 * @class Handles integration with Ammo.js, using a worker thread.
	 * See also {@link AmmoWorkerComponent}
	 * @extends System
	 * @param [Object] settings. The settings object can contain the following properties:
	 * @param {Vector3} [settings.gravity] (defaults to [0, -10, 0])
	 * @param {number} [settings.maxSubSteps=3]
	 * @param {number} [settings.timeStep=1/60]
	 * @param {number} [settings.run=true]
	 * @example
	 *     var ammoWorkerSystem = new AmmoWorkerSystem({
	 *         gravity: new Vector3(0, -10, 0),
	 *         timeStep: 1 / 60,
	 *         workerUrl: 'ammo_worker.js',
	 *         ammoUrl: 'ammo.js'
	 *     });
	 *     goo.world.setSystem(ammoWorkerSystem);
	 */
	function AmmoWorkerSystem(settings) {
		System.call(this, 'AmmoWorkerSystem', ['AmmoWorkerRigidbodyComponent', 'TransformComponent']);
		settings = settings || {};

		/** @private
		 */
		this._worker = null;

		/**
		 * Map between messageId's and Promises. Should be resolved when a message with a recognized ID gets back from worker.
		 * @private
		 * @type {Object}
		 */
		this._pendingRayCasts = {};

		/**
		 * The URL to the ammo_worker.js file.
		 * @type {string}
		 */
		this.workerUrl = typeof(settings.workerUrl) !== 'undefined' ? settings.workerUrl : 'ammo_worker.js';

		/**
		 * The URL to the ammo.js file.
		 * @type {string}
		 */
		this.ammoUrl = typeof(settings.ammoUrl) !== 'undefined' ? settings.ammoUrl : 'ammo.small.js';

		this._initWorker();
		this.setTimeStep(settings.timeStep || 1 / 60, typeof(settings.maxSubSteps) === 'number' ? settings.maxSubSteps : 3);
		this.setGravity(settings.gravity || new Vector3(0, -10, 0));

		// Start automatically if the user didn't suppy false
		if (typeof settings.run === 'undefined' || settings.run) {
			this.run();
		}
	}
	AmmoWorkerSystem.prototype = Object.create(System.prototype);

	var tmpQuat = new Quaternion();
	var messageId = 0;

	var commandHandlers = {
		rayCastResult: function (data) {
			var pending = this._pendingRayCasts;
			var result = {};
			if (data.bodyId) {
				for (var i = 0; i < this._activeEntities.length; i++) {
					var entity = this._activeEntities[i];
					if (entity.id === data.bodyId) {
						result.entity = entity;
						result.point = new Vector3(data.point);
						result.normal = new Vector3(data.normal);
					}
				}
			}
			pending[data.messageId].resolve(result);
			delete pending[data.messageId];
		}
	};

	/**
	 * Initialize the worker thread.
	 * @private
	 */
	AmmoWorkerSystem.prototype._initWorker = function () {
		// Create worker
		var worker = new Worker(this.workerUrl);

		this._worker = worker;
		var that = this;

		worker.onmessage = function (event) {
			var data = event.data;
			if (that.passive) {
				worker.postMessage(data, [data.buffer]);
				return;
			}

			if (data.command) {
				commandHandlers[data.command].call(that, data);
				return;
			}

			if (data.length) {

				// Unpack data
				for (var i = 0; i < that._activeEntities.length; i++) {
					var entity = that._activeEntities[i];
					tmpQuat.setd(data[7 * i + 3], data[7 * i + 4], data[7 * i + 5], data[7 * i + 6]);
					entity.transformComponent.transform.rotation.copyQuaternion(tmpQuat);
					entity.transformComponent.transform.translation.setd(data[7 * i + 0], data[7 * i + 1], data[7 * i + 2]);
					entity.transformComponent.setUpdated();
				}

				// Send back the buffer
				worker.postMessage(data, [data.buffer]);
			}
		};

		// Send starting message
		this._postMessage({
			command: 'init',
			ammoUrl: this.ammoUrl
		});
	};

	AmmoWorkerSystem.prototype.reset = function () {
		var entities = this._activeEntities;
		this.clear();
		for (var i = 0, len = entities.length; i < len; i++) {
			this.added(entities[i]);
		}
	};

	/**
	 * Delete the worker and create a new one.
	 */
	AmmoWorkerSystem.prototype.clear = function () {
		System.prototype.clear.apply(this);
		this._postMessage({ command: 'destroy' });
		this._worker.terminate();
		this._initWorker();
		this.setGravity(this.gravity);
		this.setTimeStep(this.timeStep, this.maxSubSteps);
	};

	/**
	 * @private
	 * @param {object} message
	 */
	AmmoWorkerSystem.prototype._postMessage = function (message) {
		this._worker.postMessage(message);
	};

	/**
	 * Starts the physics simulation.
	 */
	AmmoWorkerSystem.prototype.run = function () {
		this._postMessage({
			command: 'run'
		});
	};

	/**
	 * Steps the physics simulation.
	 */
	AmmoWorkerSystem.prototype.step = function () {
		this._postMessage({
			command: 'step'
		});
	};

	/**
	 * Stops the physics simulation.
	 */
	AmmoWorkerSystem.prototype.pause = function () {
		this._postMessage({
			command: 'pause'
		});
	};

	/**
	 * @param {Vector3} gravity
	 */
	AmmoWorkerSystem.prototype.setGravity = function (gravity) {
		this.gravity = gravity;
		this._postMessage({
			command: 'setGravity',
			gravity: v2a(gravity)
		});
	};

	/**
	 * @param {Vector3} start
	 * @param {Vector3} end
	 * @return {RSVP.Promise} Promise that resolves with the raycast results.
	 */
	AmmoWorkerSystem.prototype.rayCast = function (start, end) {
		var message = {
			command: 'rayCast',
			start: v2a(start),
			end: v2a(end),
			messageId: messageId++
		};
		this._postMessage(message);
		var p = new RSVP.Promise();
		this._pendingRayCasts[message.messageId] = p;
		return p;
	};

	/**
	 * Set the time step for physics simulation, along with the maximum number of substeps.
	 * @param {number} timeStep
	 * @param {number} maxSubSteps
	 */
	AmmoWorkerSystem.prototype.setTimeStep = function (timeStep, maxSubSteps) {
		this.timeStep = timeStep;
		this.maxSubSteps = maxSubSteps;
		this._postMessage({
			command: 'setTimeStep',
			timeStep: timeStep,
			maxSubSteps: maxSubSteps
		});
	};

	AmmoWorkerSystem.prototype.inserted = function (entity) {
		entity.ammoWorkerRigidbodyComponent._system = this;
		entity.ammoWorkerRigidbodyComponent._add();
	};

	AmmoWorkerSystem.prototype.deleted = function (entity) {
		this._postMessage({
			command: 'removeBody',
			id: entity.id
		});
		delete entity.ammoWorkerRigidbodyComponent._system;
	};

	AmmoWorkerSystem.prototype.process = function (/*entities, tpf*/) {

	};

	function v2a(v) {
		return Array.prototype.slice.call(v.data, 0);
	}

	return AmmoWorkerSystem;
});
