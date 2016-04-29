/* Goo Engine UNOFFICIAL
 * Copyright 2016 Goo Technologies AB
 */

webpackJsonp([3],{

/***/ 0:
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(101);


/***/ },

/***/ 101:
/***/ function(module, exports, __webpack_require__) {

	module.exports = {
		CannonBoxColliderComponent: __webpack_require__(102),
		CannonCylinderColliderComponent: __webpack_require__(103),
		CannonDistanceJointComponent: __webpack_require__(104),
		CannonPlaneColliderComponent: __webpack_require__(105),
		CannonRigidbodyComponent: __webpack_require__(106),
		CannonSphereColliderComponent: __webpack_require__(107),
		CannonSystem: __webpack_require__(108),
		CannonTerrainColliderComponent: __webpack_require__(109)
	};
	if (typeof(window) !== 'undefined') {
		for (var key in module.exports) {
			window.goo[key] = module.exports[key];
		}
	}

/***/ },

/***/ 102:
/***/ function(module, exports, __webpack_require__) {

	var Component = __webpack_require__(20);
	var Vector3 = __webpack_require__(8);

	/* global CANNON */

	/**
	 * Physics box collider for Cannon.js. To be attached to an entity with a {@link CannonRigidbodyComponent}. Also see the {@link CannonSystem}.
	 * @example-link http://code.gooengine.com/latest/visual-test/goo/addons/Cannon/Cannon-vtest.html Working example
	 * @param {Object} [settings]
	 * @param {Vector3} [settings.halfExtents] The half-extents of the box collider.
	 * @extends Component
	 */
	function CannonBoxColliderComponent(settings) {
		Component.apply(this, arguments);

		this.type = 'CannonBoxColliderComponent';

		settings = settings || {};
		var e = this.halfExtents = settings.halfExtents || new Vector3(0.5, 0.5, 0.5);

		// Create shape
		this.cannonShape = new CANNON.Box(new CANNON.Vec3(e.x, e.y, e.z));

		this.isTrigger = typeof settings.isTrigger !== 'undefined' ? settings.isTrigger : false;
	}

	CannonBoxColliderComponent.prototype = Object.create(Component.prototype);
	CannonBoxColliderComponent.constructor = CannonBoxColliderComponent;

	module.exports = CannonBoxColliderComponent;


/***/ },

/***/ 103:
/***/ function(module, exports, __webpack_require__) {

	var Component = __webpack_require__(20);

	/* global CANNON */

	/**
	 * Sphere collider for the {@link CannonSystem}.
	 * @example-link http://code.gooengine.com/latest/visual-test/goo/addons/Cannon/Cannon-vtest.html Working example
	 * @param {Object} [settings]
	 * @param {number} [settings.radiusTop=0.5]
	 * @param {number} [settings.radiusBottom=0.5]
	 * @param {number} [settings.height=0.5]
	 * @param {number} [settings.numSegments=10]
	 */
	function CannonCylinderColliderComponent(settings) {
		Component.apply(this, arguments);

		settings = settings || {};
		this.type = 'CannonCylinderColliderComponent';

		var radiusTop = typeof settings.radiusTop === 'number' ? settings.radiusTop : 0.5;
		var radiusBottom = typeof settings.radiusBottom === 'number' ? settings.radiusBottom : 0.5;
		var height = typeof settings.height === 'number' ? settings.height : 1;
		var numSegments = typeof settings.numSegments === 'number' ? settings.numSegments : 10;

		this.cannonShape = new CANNON.Cylinder(
			radiusTop,
			radiusBottom,
			height,
			numSegments
		);
	}
	CannonCylinderColliderComponent.prototype = Object.create(Component.prototype);
	CannonCylinderColliderComponent.constructor = CannonCylinderColliderComponent;

	module.exports = CannonCylinderColliderComponent;


/***/ },

/***/ 104:
/***/ function(module, exports, __webpack_require__) {

	var Component = __webpack_require__(20);
	var ObjectUtils = __webpack_require__(6);

	/* global CANNON */

	/**
	 * Distance joint. Add to an entity with a {@link CannonRigidbodyComponent} and physically link it to another entity!<br>
	 * @example-link http://code.gooengine.com/latest/visual-test/goo/addons/Cannon/Cannon-vtest.html Working example
	 * @extends Component
	 * @param {Object} [settings]
	 * @param {number} [settings.distance=1]
	 * @param {CannonRigidbodyComponent} settings.connectedBody
	 */
	function CannonDistanceJointComponent(settings) {
		Component.apply(this, arguments);

		settings = settings || {};
		this.type = 'CannonDistanceJointComponent';

		ObjectUtils.defaults(settings, {
			distance: 1,
			connectedBody: null
		});

		this.distance = settings.distance;
		this.connectedBody = settings.connectedBody;

		this.cannonConstraint = null;
	}
	CannonDistanceJointComponent.prototype = Object.create(Component.prototype);
	CannonDistanceJointComponent.constructor = CannonDistanceJointComponent;

	CannonDistanceJointComponent.prototype.createConstraint = function (entity) {
		var bodyA = entity.cannonRigidbodyComponent.body;
		var bodyB = this.connectedBody.body;
		this.cannonConstraint = new CANNON.DistanceConstraint(bodyA, bodyB, this.distance);
		return this.cannonConstraint;
	};

	module.exports = CannonDistanceJointComponent;


/***/ },

/***/ 105:
/***/ function(module, exports, __webpack_require__) {

	var Component = __webpack_require__(20);

	/* global CANNON */

	/**
	 * Plane collider. Attach to an entity with a {@link CannonRigidbodyComponent}.
	 * @example-link http://code.gooengine.com/latest/visual-test/goo/addons/Cannon/Cannon-vtest.html Working example
	 * @param {Object} [settings]
	 */
	function CannonPlaneColliderComponent(settings) {
		Component.apply(this, arguments);

		this.type = 'CannonPlaneColliderComponent';

		settings = settings || {};

		// Create shape
		this.cannonShape = new CANNON.Plane();
	}

	CannonPlaneColliderComponent.prototype = Object.create(Component.prototype);
	CannonPlaneColliderComponent.constructor = CannonPlaneColliderComponent;

	module.exports = CannonPlaneColliderComponent;


/***/ },

/***/ 106:
/***/ function(module, exports, __webpack_require__) {

	var Component = __webpack_require__(20);
	var Quaternion = __webpack_require__(23);
	var Vector3 = __webpack_require__(8);
	var Transform = __webpack_require__(41);
	var ObjectUtils = __webpack_require__(6);

	/* global CANNON */

	/**
	 * Adds Cannon physics to an entity. Should be combined with one of the CannonCollider components, such as the {@link CannonSphereColliderComponent}. Also see {@link CannonSystem}.
	 * @extends Component
	 * @param {Object} [settings]
	 * @param {number} [settings.mass=1]
	 * @example-link http://code.gooengine.com/latest/visual-test/goo/addons/Cannon/Cannon-vtest.html Working example
	 * @example
	 * world.setSystem(new CannonSystem());
	 * var entity = world.createEntity();
	 * var rigidBodyComponent = new CannonRigidBodyComponent({
	 *   mass: 1
	 * });
	 * entity.setComponent(rigidBodyComponent);
	 * var boxColliderComponent = new CannonBoxColliderComponent({
	 *   halfExtents: new Vector3(1, 1, 1)
	 * });
	 * entity.setComponent(boxColliderComponent);
	 */
	function CannonRigidbodyComponent(settings) {
		Component.apply(this, arguments);

		settings = settings || {};
		this.type = 'CannonRigidbodyComponent';

		ObjectUtils.defaults(settings, {
			mass: 1,
			velocity: new Vector3()
			// Todo: a lot of more things from Cannon.js API
		}); //! AT: this is modifying the settings object which is bad practice (as in 'unintended side effects')

		this.mass = settings.mass;
		this._initialPosition = null;
		this._initialVelocity = new Vector3();
		this._initialVelocity.set(settings.velocity);
		this.body = null;
		this.centerOfMassOffset = new Vector3();
	}

	CannonRigidbodyComponent.prototype = Object.create(Component.prototype);
	CannonRigidbodyComponent.constructor = CannonRigidbodyComponent;

	CannonRigidbodyComponent.prototype.api = {
		setForce: function (force) {
			CannonRigidbodyComponent.prototype.setForce.call(this.cannonRigidbodyComponent, force);
		},
		setVelocity: function (velocity) {
			CannonRigidbodyComponent.prototype.setVelocity.call(this.cannonRigidbodyComponent, velocity);
		},
		// schteppe: needs to be separate from the transformcomponent setTranslation, since the transformcomponent data will get overridden by physics
		setPosition: function (pos) {
			CannonRigidbodyComponent.prototype.setPosition.call(this.cannonRigidbodyComponent, pos);
		},
		setAngularVelocity: function (angularVelocity) {
			CannonRigidbodyComponent.prototype.setAngularVelocity.call(this.cannonRigidbodyComponent, angularVelocity);
		}
	};

	var tmpQuat = new Quaternion();

	/**
	 * Set the force on the body
	 * @param {Vector3} force
	 */
	CannonRigidbodyComponent.prototype.setForce = function (force) {
		this.body.force.set(force.x, force.y, force.z);
	};

	/**
	 * Set the velocity on the body
	 * @param {Vector3} velocity
	 */
	CannonRigidbodyComponent.prototype.setVelocity = function (velocity) {
		this.body.velocity.set(velocity.x, velocity.y, velocity.z);
	};

	/**
	 * Set the body position.
	 * @param {Vector3} position
	 */
	CannonRigidbodyComponent.prototype.setPosition = function (pos) {
		if (this.body) {
			this.body.position.set(pos.x, pos.y, pos.z);
		} else {
			this._initialPosition = new Vector3(pos);
		}
	};

	/**
	 * Set the body angular velocity position.
	 * @param {Vector3} angularVelocity
	 */
	CannonRigidbodyComponent.prototype.setAngularVelocity = function (angularVelocity) {
		this.body.angularVelocity.set(angularVelocity.x, angularVelocity.y, angularVelocity.z);
	};

	/**
	 * Get the collider component from an entity, if one exist.
	 * @returns {mixed} Any of the collider types, or NULL if not found
	 */
	CannonRigidbodyComponent.getCollider = function (entity) {
		return entity.cannonBoxColliderComponent || entity.cannonPlaneColliderComponent || entity.cannonSphereColliderComponent || entity.cannonTerrainColliderComponent || entity.cannonCylinderColliderComponent || null;
	};

	CannonRigidbodyComponent.prototype.addShapesToBody = function (entity) {
		var body = entity.cannonRigidbodyComponent.body;

		var collider = CannonRigidbodyComponent.getCollider(entity);
		if (!collider) {
			// Needed for getting the Rigidbody-local transform of each collider
			var bodyTransform = entity.transformComponent.sync().worldTransform;
			var invBodyTransform = new Transform();
			invBodyTransform.copy(bodyTransform);
			invBodyTransform.invert(invBodyTransform);
			var gooTrans = new Transform();

			var cmOffset = this.centerOfMassOffset;

			entity.traverse(function (childEntity) {
				var collider = CannonRigidbodyComponent.getCollider(childEntity);
				if (collider) {
					// Look at the world transform and then get the transform relative to the root entity. This is needed for compounds with more than one level of recursion
					gooTrans.copy(childEntity.transformComponent.sync().worldTransform);
					var gooTrans2 = new Transform();
					Transform.combine(invBodyTransform, gooTrans, gooTrans2);
					gooTrans2.update();

					// var gooTrans2 = new Transform();
					// gooTrans2.copy(childEntity.transformComponent.transform);

					var trans = gooTrans2.translation;
					var rot = gooTrans2.rotation;

					var offset = new CANNON.Vec3(trans.x, trans.y, trans.z);
					var q = tmpQuat;
					q.fromRotationMatrix(rot);
					var orientation = new CANNON.Quaternion(q.x, q.y, q.z, q.w);

					// var o2 = orientation.clone();
					// o2.w *= -1;
					// o2.vmult(offset, offset);

					// Subtract center of mass offset
					offset.vadd(cmOffset, offset);

					if (collider.isTrigger) {
						collider.cannonShape.collisionResponse = false;
					}

					// Add the shape
					body.addShape(collider.cannonShape, offset, orientation);
				}
			});
		} else {
			// Entity has a collider on the root
			// Create a simple shape
			body.addShape(collider.cannonShape);
		}
	};

	module.exports = CannonRigidbodyComponent;


/***/ },

/***/ 107:
/***/ function(module, exports, __webpack_require__) {

	var Component = __webpack_require__(20);

	/* global CANNON */

	/**
	 * Sphere collider for the {@link CannonSystem}.
	 * @example-link http://code.gooengine.com/latest/visual-test/goo/addons/Cannon/Cannon-vtest.html Working example
	 * @param {Object} [settings]
	 * @param {number} [settings.radius=0.5]
	 */
	function CannonSphereColliderComponent(settings) {
		Component.apply(this, arguments);

		settings = settings || {};
		this.type = 'CannonSphereColliderComponent';
		this.radius = settings.radius || 0.5;
		this.cannonShape = new CANNON.Sphere(this.radius);
	}
	CannonSphereColliderComponent.prototype = Object.create(Component.prototype);
	CannonSphereColliderComponent.constructor = CannonSphereColliderComponent;

	module.exports = CannonSphereColliderComponent;


/***/ },

/***/ 108:
/***/ function(module, exports, __webpack_require__) {

	var System = __webpack_require__(42);
	var Quaternion = __webpack_require__(23);
	var Vector3 = __webpack_require__(8);
	var ObjectUtils = __webpack_require__(6);

	/* global CANNON, performance */

	/**
	 * Cannon.js physics system. Depends on the global CANNON object, so load cannon.js using a script tag before using this system. See also {@link CannonRigidbodyComponent}.
	 * @extends System
	 * @param {Object} [settings]
	 * @param {number} [settings.stepFrequency=60]
	 * @param {Vector3} [settings.gravity] The gravity to use in the scene. Default is (0, -10, 0)
	 * @param {string} [settings.broadphase='naive'] One of: 'naive' (NaiveBroadphase), 'sap' (SAPBroadphase)
	 * @example-link http://code.gooengine.com/latest/visual-test/goo/addons/Cannon/Cannon-vtest.html Working example
	 * @example
	 * var cannonSystem = new CannonSystem({
	 *     stepFrequency: 60,
	 *     gravity: new Vector3(0, -10, 0)
	 * });
	 * goo.world.setSystem(cannonSystem);
	 */
	function CannonSystem(settings) {
		System.call(this, 'CannonSystem', ['CannonRigidbodyComponent', 'TransformComponent']);

		settings = settings || {};

		ObjectUtils.defaults(settings, {
			gravity: new Vector3(0, -10, 0),
			stepFrequency: 60,
			broadphase: 'naive'
		});

		this.priority = 1; // make sure it processes after transformsystem

		var world = this.physicsWorld = new CANNON.World();
		world.gravity.x = settings.gravity.x;
		world.gravity.y = settings.gravity.y;
		world.gravity.z = settings.gravity.z;
		this.setBroadphaseAlgorithm(settings.broadphase);
		this.stepFrequency = settings.stepFrequency;
		this.maxSubSteps = settings.maxSubSteps || 0;
	}
	var tmpQuat = new Quaternion();

	CannonSystem.prototype = Object.create(System.prototype);
	CannonSystem.prototype.constructor = CannonSystem;

	CannonSystem.prototype.reset = function () {
		for (var i = 0; i < this._activeEntities.length; i++) {
			var entity = this._activeEntities[i];

			if (entity.cannonRigidbodyComponent.added) {
				var body = entity.cannonRigidbodyComponent.body;
				var p = entity.transformComponent.sync().worldTransform.translation;
				var q = new Quaternion();
				q.fromRotationMatrix(entity.transformComponent.worldTransform.rotation);
				body.position.set(p.x, p.y, p.z);
				body.quaternion.set(q.x, q.y, q.z, q.w);
				body.velocity.set(0, 0, 0);
				body.angularVelocity.set(0, 0, 0);
			}
		}
	};


	CannonSystem.prototype.inserted = function (entity) {
		var rbComponent = entity.cannonRigidbodyComponent;
		rbComponent.body = null;
	};

	CannonSystem.prototype.deleted = function (entity) {
		var rbComponent = entity.cannonRigidbodyComponent;

		if (rbComponent && rbComponent.body) {
			// TODO: remove joints?
			this.physicsWorld.remove(rbComponent.body);
			rbComponent.body = null;
		}
	};

	var tmpVec = new Vector3();
	CannonSystem.prototype.process = function (entities) {
		var world = this.physicsWorld;

		// Add unadded entities
		for (var i = 0; i < entities.length; i++) {
			var entity = entities[i];
			var rbComponent = entity.cannonRigidbodyComponent;
			if (rbComponent && rbComponent.added) {
				continue;
			}

			var transformComponent = entity.transformComponent;

			var body = new CANNON.Body({
				mass: rbComponent.mass
			});
			rbComponent.body = body;
			rbComponent.addShapesToBody(entity);
			if (!body.shapes.length) {
				entity.clearComponent('CannonRigidbodyComponent');
				continue;
			}

			// Get the world transform from the entity and set on the body
			if (!rbComponent._initialPosition) {
				entity.setPosition(transformComponent.sync().transform.translation);
			} else {
				entity.setPosition(rbComponent._initialPosition);
			}
			entity.setVelocity(rbComponent._initialVelocity);
			var q = tmpQuat;
			q.fromRotationMatrix(transformComponent.sync().transform.rotation);
			body.quaternion.set(q.x, q.y, q.z, q.w);

			world.add(body);

			var c = entity.cannonDistanceJointComponent;
			if (c) {
				world.addConstraint(c.createConstraint(entity));
			}
			rbComponent.added = true;
		}

		// Step the world forward in time
		var fixedTimeStep = 1 / this.stepFrequency;
		var maxSubSteps = this.maxSubSteps;
		if (maxSubSteps) {
			var now = performance.now() / 1000.0;
			if (!this._lastTime) {
				this._lastTime = now;
			}
			var dt = now - this._lastTime;
			this._lastTime = now;
			world.step(fixedTimeStep, dt, maxSubSteps);
		} else {
			world.step(fixedTimeStep);
		}

		// Update positions of entities from the physics data
		for (var i = 0; i < entities.length; i++) {
			var entity = entities[i];
			var cannonComponent = entity.cannonRigidbodyComponent;
			if (!cannonComponent) {
				continue;
			}

			cannonComponent.body.computeAABB(); // Quick fix
			var cannonQuat = cannonComponent.body.quaternion;
			var position = cannonComponent.body.position;

			// Add center of mass offset
			cannonQuat.vmult(cannonComponent.centerOfMassOffset, tmpVec);
			position.vadd(tmpVec, tmpVec);
			entity.transformComponent.transform.translation.setDirect(tmpVec.x, tmpVec.y, tmpVec.z);

			tmpQuat.setDirect(cannonQuat.x, cannonQuat.y, cannonQuat.z, cannonQuat.w);
			entity.transformComponent.transform.rotation.copyQuaternion(tmpQuat);
			entity.transformComponent.setUpdated();
		}
	};

	/**
	 * Set the broadphase algorithm to use
	 * @param {string} algorithm One of: 'naive' (NaiveBroadphase), 'sap' (SAPBroadphase)
	 */
	CannonSystem.prototype.setBroadphaseAlgorithm = function (algorithm) {
		var world = this.physicsWorld;
		switch (algorithm) {
		case 'naive':
			world.broadphase = new CANNON.NaiveBroadphase();
			break;
		case 'sap':
			world.broadphase = new CANNON.SAPBroadphase(world);
			break;
		default:
			throw new Error('Broadphase not supported: ' + algorithm);
		}
	};

	module.exports = CannonSystem;


/***/ },

/***/ 109:
/***/ function(module, exports, __webpack_require__) {

	var Component = __webpack_require__(20);

	/* global CANNON */

	/**
	 * Terrain collider. Attach to an entity with a {@link CannonRigidbodyComponent}.
	 * @param {Object} [settings]
	 * @param {Object} [settings.data]
	 * @param {Object} [settings.shapeOptions]
	 */
	function CannonTerrainColliderComponent(settings) {
		Component.apply(this, arguments);

		this.type = 'CannonTerrainColliderComponent';

		settings = settings || {
			data: [],
			shapeOptions: {}
		};

		// Create shape
		this.cannonShape = new CANNON.Heightfield(settings.data, settings.shapeOptions);
	}

	CannonTerrainColliderComponent.prototype = Object.create(Component.prototype);
	CannonTerrainColliderComponent.constructor = CannonTerrainColliderComponent;

	module.exports = CannonTerrainColliderComponent;


/***/ }

});
