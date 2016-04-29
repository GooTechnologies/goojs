/* Goo Engine UNOFFICIAL
 * Copyright 2016 Goo Technologies AB
 */

webpackJsonp([15],{

/***/ 0:
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(445);


/***/ },

/***/ 445:
/***/ function(module, exports, __webpack_require__) {

	module.exports = {
		BoxCollider: __webpack_require__(446),
		Collider: __webpack_require__(447),
		CylinderCollider: __webpack_require__(448),
		MeshCollider: __webpack_require__(449),
		PlaneCollider: __webpack_require__(450),
		SphereCollider: __webpack_require__(451),
		AbstractColliderComponent: __webpack_require__(452),
		AbstractRigidBodyComponent: __webpack_require__(453),
		ColliderComponent: __webpack_require__(454),
		RigidBodyComponent: __webpack_require__(455),
		ColliderComponentHandler: __webpack_require__(459),
		RigidBodyComponentHandler: __webpack_require__(461),
		BallJoint: __webpack_require__(456),
		HingeJoint: __webpack_require__(458),
		PhysicsJoint: __webpack_require__(457),
		PhysicsMaterial: __webpack_require__(460),
		RaycastResult: __webpack_require__(462),
		PhysicsBoxDebugShape: __webpack_require__(463),
		PhysicsCylinderDebugShape: __webpack_require__(464),
		PhysicsPlaneDebugShape: __webpack_require__(465),
		PhysicsSphereDebugShape: __webpack_require__(466),
		AbstractPhysicsSystem: __webpack_require__(467),
		ColliderSystem: __webpack_require__(468),
		PhysicsDebugRenderSystem: __webpack_require__(469),
		PhysicsSystem: __webpack_require__(471),
		Pool: __webpack_require__(470)
	};

	if (typeof(window) !== 'undefined') {
		for (var key in module.exports) {
			window.goo[key] = module.exports[key];
		}
	}

/***/ },

/***/ 446:
/***/ function(module, exports, __webpack_require__) {

	var Vector3 = __webpack_require__(8);
	var Collider = __webpack_require__(447);

	/**
	 * Physics box collider.
	 * @param {Object} [settings]
	 * @param {Vector3} [settings.halfExtents] The half-extents of the box collider.
	 * @extends Collider
	 */
	function BoxCollider(settings) {
		settings = settings || {};

		/**
		 * @type {Vector3}
		 */
		this.halfExtents = settings.halfExtents ? new Vector3(settings.halfExtents) : new Vector3(0.5, 0.5, 0.5);

		Collider.call(this);
	}
	BoxCollider.prototype = Object.create(Collider.prototype);
	BoxCollider.prototype.constructor = BoxCollider;

	/**
	 * @private
	 * @param {Transform} transform
	 * @param {Collider} targetCollider
	 */
	BoxCollider.prototype.transform = function (transform, targetCollider) {
		targetCollider.halfExtents.set(transform.scale).mul(this.halfExtents);
	};

	/**
	 * Clone the collider
	 * @returns {BoxCollider}
	 */
	BoxCollider.prototype.clone = function () {
		return new BoxCollider({
			halfExtents: this.halfExtents
		});
	};

	module.exports = BoxCollider;


/***/ },

/***/ 447:
/***/ function(module, exports) {

	/**
	 * Base class for Colliders.
	 */
	function Collider() {}

	/**
	 * @virtual
	 * @returns {Collider}
	 */
	Collider.prototype.clone = function () {
		return new Collider();
	};

	/**
	 * @private
	 * @virtual
	 * @param {Transform} transform
	 * @param {Collider} targetCollider
	 */
	Collider.prototype.transform = function (/*transform, targetCollider*/) {};

	module.exports = Collider;


/***/ },

/***/ 448:
/***/ function(module, exports, __webpack_require__) {

	var Collider = __webpack_require__(447);

	/**
	 * Cylinder collider, that extends along the Z axis.
	 * @param {Object} [settings]
	 * @param {number} [settings.radius=0.5]
	 * @param {number} [settings.height=1]
	 * @extends Collider
	 */
	function CylinderCollider(settings) {
		settings = settings || {};

		/**
		 * @type {number}
		 */
		this.radius = settings.radius !== undefined ? settings.radius : 0.5;

		/**
		 * @type {number}
		 */
		this.height = settings.height !== undefined ? settings.height : 1;

		Collider.call(this);
	}
	CylinderCollider.prototype = Object.create(Collider.prototype);
	CylinderCollider.prototype.constructor = CylinderCollider;

	/**
	 * @private
	 * @param {Transform} transform
	 * @param {Collider} targetCollider
	 */
	CylinderCollider.prototype.transform = function (transform, targetCollider) {
		var s = transform.scale;
		targetCollider.radius = Math.max(s.x, s.y) * this.radius;
		targetCollider.height = s.z * this.height;
	};

	/**
	 * @returns {CylinderCollider}
	 */
	CylinderCollider.prototype.clone = function () {
		return new CylinderCollider({
			radius: this.radius,
			height: this.height
		});
	};

	module.exports = CylinderCollider;


/***/ },

/***/ 449:
/***/ function(module, exports, __webpack_require__) {

	var Collider = __webpack_require__(447);
	var Vector3 = __webpack_require__(8);

	/**
	 * Physics mesh collider.
	 * @param {Object} [settings]
	 * @param {MeshData} [settings.meshData]
	 * @param {Vector3} [settings.scale]
	 * @extends Collider
	 */
	function MeshCollider(settings) {
		settings = settings || {};

		/**
		 * @type {MeshData}
		 */
		this.meshData = settings.meshData;

		/**
		 * @type {Vector3}
		 */
		this.scale = settings.scale !== undefined ? new Vector3(settings.scale) : new Vector3(1, 1, 1);

		Collider.call(this);
	}
	MeshCollider.prototype = Object.create(Collider.prototype);
	MeshCollider.prototype.constructor = MeshCollider;

	/**
	 * @private
	 * @param {Transform} transform
	 * @param {Collider} targetCollider
	 */
	MeshCollider.prototype.transform = function (transform, targetCollider) {
		targetCollider.scale.set(this.scale).mul(transform.scale);
	};

	/**
	 * @returns {MeshCollider}
	 */
	MeshCollider.prototype.clone = function () {
		return new MeshCollider({
			meshData: this.meshData,
			scale: this.scale
		});
	};

	module.exports = MeshCollider;


/***/ },

/***/ 450:
/***/ function(module, exports, __webpack_require__) {

	var Collider = __webpack_require__(447);

	/**
	 * Plane collider, that faces in the Z direction.
	 * @extends Collider
	 */
	function PlaneCollider() {
		Collider.call(this);
	}
	PlaneCollider.prototype = Object.create(Collider.prototype);
	PlaneCollider.prototype.constructor = PlaneCollider;

	/**
	 * @private
	 * @param {Transform} transform
	 * @param {Collider} targetCollider
	 */
	PlaneCollider.prototype.transform = function (/*transform, targetCollider*/) {};

	/**
	 * @returns {PlaneCollider}
	 */
	PlaneCollider.prototype.clone = function () {
		return new PlaneCollider();
	};

	module.exports = PlaneCollider;


/***/ },

/***/ 451:
/***/ function(module, exports, __webpack_require__) {

	var Collider = __webpack_require__(447);

	/**
	 * @param {Object} [settings]
	 * @param {number} [settings.radius=0.5]
	 * @extends Collider
	 */
	function SphereCollider(settings) {
		settings = settings || {};

		/**
		 * @type {number}
		 */
		this.radius = settings.radius !== undefined ? settings.radius : 0.5;

		Collider.call(this);
	}
	SphereCollider.prototype = Object.create(Collider.prototype);
	SphereCollider.prototype.constructor = SphereCollider;

	/**
	 * @private
	 * @param {Transform} transform
	 * @param {Collider} targetCollider
	 */
	SphereCollider.prototype.transform = function (transform, targetCollider) {
		var scale = transform.scale;
		targetCollider.radius = this.radius * Math.max(
			Math.abs(scale.x),
			Math.abs(scale.y),
			Math.abs(scale.z)
		);
	};

	/**
	 * @returns {SphereCollider}
	 */
	SphereCollider.prototype.clone = function () {
		return new SphereCollider({
			radius: this.radius
		});
	};

	module.exports = SphereCollider;


/***/ },

/***/ 452:
/***/ function(module, exports, __webpack_require__) {

	var Component = __webpack_require__(20);
	var Collider = __webpack_require__(447);

	/**
	 * Adds a physics collider to the entity. If the entity or any of its ancestors have a {RigidBodyComponent}, the collider is added to the physics world.
	 * @param {Object} [settings]
	 * @param {Collider} [settings.collider]
	 * @param {boolean} [settings.isTrigger=false]
	 * @extends Component
	 */
	function AbstractColliderComponent(settings) {
		Component.apply(this);

		settings = settings || {};

		/**
		 * @private
		 * @type {Entity}
		 */
		this.entity = null;

		/**
		 * @type {Collider}
		 */
		this.collider = settings.collider || null;

		/**
		 * The world-scaled version of the collider. Use .updateWorldCollider() to update it.
		 * @type {Collider}
		 */
		this.worldCollider = this.collider ? this.collider.clone() : null;

		/**
		 * If the collider is a Trigger, it does not interact with other objects, but it does emit contact events.
		 * @type {boolean}
		 */
		this.isTrigger = settings.isTrigger !== undefined ? settings.isTrigger : false;

		/**
		 * The entity with a rigid body component that instantiated the collider, or null if it wasn't instantiated.
		 * @type {Entity}
		 */
		this.bodyEntity = null;

		/**
		 * The collider material.
		 * @type {PhysicsMaterial}
		 */
		this.material = settings.material !== undefined ? settings.material : null;
	}
	AbstractColliderComponent.prototype = Object.create(Component.prototype);
	AbstractColliderComponent.prototype.constructor = AbstractColliderComponent;

	/**
	 * Get the closest parent (or self) entity that has a RigidBodyComponent. Returns undefined if none was found.
	 * @returns {Entity}
	 */
	AbstractColliderComponent.prototype.getBodyEntity = function () {
		var bodyEntity;
		this.entity.traverseUp(function (parent) {
			if (parent.rigidBodyComponent) {
				bodyEntity = parent;
				return false;
			}
		});
		return bodyEntity;
	};

	/**
	 * Updates the .worldCollider
	 */
	AbstractColliderComponent.prototype.updateWorldCollider = function () {
		this.collider.transform(this.entity.transformComponent.sync().worldTransform, this.worldCollider);
	};

	/**
	 * Handles attaching itself to an entity. Should only be called by the engine.
	 * @private
	 * @param entity
	 */
	AbstractColliderComponent.prototype.attached = function (entity) {
		this.entity = entity;
		this.system = entity._world.getSystem('PhysicsSystem');
	};

	/**
	 * Handles detaching itself to an entity. Should only be called by the engine.
	 * @private
	 * @param entity
	 */
	AbstractColliderComponent.prototype.detached = function (/*entity*/) {
		this.entity = null;
	};

	/**
	 * @private
	 * @param  {Object} obj
	 * @param  {Entity} entity
	 * @returns {boolean}
	 */
	AbstractColliderComponent.applyOnEntity = function (obj, entity) {
		if (obj instanceof Collider) {
			entity.setComponent(new AbstractColliderComponent({
				collider: obj
			}));
			return true;
		}
	};

	AbstractColliderComponent.prototype.api = {};

	module.exports = AbstractColliderComponent;


/***/ },

/***/ 453:
/***/ function(module, exports, __webpack_require__) {

	var Component = __webpack_require__(20);
	var Quaternion = __webpack_require__(23);
	var Transform = __webpack_require__(41);
	var SystemBus = __webpack_require__(44);

	var tmpQuat = new Quaternion();

	/**
	 * Base class for rigid bodies.
	 * @extends Component
	 */
	function AbstractRigidBodyComponent() {
		Component.call(this, arguments);

		/**
		 * Joints on the body. Use .addJoint to add one, or .removeJoint to remove.
		 * @type {Array}
		 */
		this.joints = [];
	}
	AbstractRigidBodyComponent.prototype = Object.create(Component.prototype);
	AbstractRigidBodyComponent.prototype.constructor = AbstractRigidBodyComponent;

	/**
	 * @param {PhysicsJoint}  joint
	 */
	AbstractRigidBodyComponent.prototype.addJoint = function (joint) {
		this.joints.push(joint);
	};

	/**
	 * @param {PhysicsJoint}  joint
	 */
	AbstractRigidBodyComponent.prototype.removeJoint = function (joint) {
		var joints = this.joints;
		var index = joints.indexOf(joint);
		if (index !== -1) {
			joints.splice(index, 1);
		}
	};

	AbstractRigidBodyComponent.initializedEvent = {
		entity: null
	};

	/**
	 * Should be called by subclasses when initializing the physics engine body.
	 * @param  {Entity} entity
	 */
	AbstractRigidBodyComponent.prototype.emitInitialized = function (entity) {
		var event = AbstractRigidBodyComponent.initializedEvent;
		event.entity = entity;
		SystemBus.emit('goo.physics.initialized', event);
		event.entity = null; // Remove reference, don't need it any more
	};

	/**
	 * Creates the physics engine rigid body and adds it to the simulation
	 * @virtual
	 */
	AbstractRigidBodyComponent.prototype.initialize = function () {};

	/**
	 * @virtual
	 */
	AbstractRigidBodyComponent.prototype.destroy = function () {};

	/**
	 * Creates a joint in the physics engine.
	 * @virtual
	 * @param {PhysicsJoint}  joint
	 * @param {Entity} entity
	 * @param {System} system
	 */
	AbstractRigidBodyComponent.prototype.initializeJoint = function (/*joint, entity, system*/) {};

	/**
	 * Removes a joint from the physics engine.
	 * @virtual
	 * @param {PhysicsJoint}  joint
	 */
	AbstractRigidBodyComponent.prototype.destroyJoint = function (/*joint*/) {};

	var inverseBodyTransform = new Transform();
	var trans = new Transform();
	var trans2 = new Transform();

	/**
	 * Traverse the tree of colliders from a root entity and down.
	 * @param  {Entity}   entity
	 * @param  {Function} callback A callback to be called for each collider below or on the same entity. The arguments to the callback are: colliderEntity, collider, localPosition and localQuaternion.
	 */
	AbstractRigidBodyComponent.prototype.traverseColliders = function (entity, callback) {
		var bodyTransform = entity.transformComponent.sync().worldTransform;
		inverseBodyTransform.copy(bodyTransform);
		inverseBodyTransform.invert(inverseBodyTransform);

		// Traverse the entities depth first, but skip nodes below other rigid body components
		var queue = [entity];
		while (queue.length) {
			var childEntity = queue.pop();

			var collider = childEntity.colliderComponent;
			if (collider) {
				childEntity.transformComponent.sync();

				// Look at the world transform and then get the transform relative to the root entity. This is needed for compounds with more than one level of recursion
				trans.copy(childEntity.transformComponent.worldTransform);
				Transform.combine(inverseBodyTransform, trans, trans2);

				var offset = trans2.translation;
				var rot = trans2.rotation;
				tmpQuat.fromRotationMatrix(rot);

				// Add the shape
				callback.call(this, childEntity, collider.collider, offset, tmpQuat);
			}

			// Add children that don't have rigid body components.
			var childTransformComponents = childEntity.transformComponent.children;
			for (var i = 0; i < childTransformComponents.length; i++) {
				var e = childTransformComponents[i].entity;
				if (!e.rigidBodyComponent) {
					queue.push(e);
				}
			}
		}
	};

	/**
	 * @private
	 * @virtual
	 * @param entity
	 */
	AbstractRigidBodyComponent.prototype.attached = function (/*entity*/) {};

	/**
	 * @private
	 * @param entity
	 */
	AbstractRigidBodyComponent.prototype.attached = function (entity) {
		this._entity = entity;
		this._system = entity._world.getSystem('PhysicsSystem');
	};

	/**
	 * @private
	 * @param entity
	 */
	AbstractRigidBodyComponent.prototype.detached = function (/*entity*/) {
		this._entity = null;
		this._system = null;
	};

	module.exports = AbstractRigidBodyComponent;


/***/ },

/***/ 454:
/***/ function(module, exports, __webpack_require__) {

	var AbstractColliderComponent = __webpack_require__(452);
	var BoxCollider = __webpack_require__(446);
	var SphereCollider = __webpack_require__(451);
	var MeshCollider = __webpack_require__(449);
	var PlaneCollider = __webpack_require__(450);
	var CylinderCollider = __webpack_require__(448);
	var Collider = __webpack_require__(447);
	var Vector3 = __webpack_require__(8);
	var Quaternion = __webpack_require__(23);

	var tmpQuat = new Quaternion();

	/* global CANNON */

	/**
	 * Adds a physics collider to the entity. If the entity or any of its ancestors have a {RigidBodyComponent}, the collider is added to the physics world.
	 * @param {Object} [settings]
	 * @param {Collider} [settings.collider]
	 * @param {boolean} [settings.isTrigger=false]
	 * @extends AbstractColliderComponent
	 */
	function ColliderComponent(settings) {
		AbstractColliderComponent.apply(this, arguments);
		this.type = 'ColliderComponent';
		settings = settings || {};

		/**
		 * The Cannon.js Body instance, if the ColliderComponent was initialized without a RigidBodyComponent.
		 * @type {CANNON.Body}
		 */
		this.cannonBody = null;

		/**
		 * The Cannon.js Shape instance
		 * @type {CANNON.Body}
		 */
		this.cannonShape = null;
	}

	ColliderComponent.prototype = Object.create(AbstractColliderComponent.prototype);
	ColliderComponent.prototype.constructor = ColliderComponent;

	ColliderComponent.type = 'ColliderComponent';

	/**
	 * Initialize the collider as a static rigid body in the physics world.
	 */
	ColliderComponent.prototype.initialize = function () {
		var material = null;
		if (this.material) {
			material = new CANNON.Material();
			material.friction = this.material.friction;
			material.restitution = this.material.restitution;
		}
		this.updateWorldCollider();
		var cannonShape = this.cannonShape = ColliderComponent.getCannonShape(this.worldCollider);
		cannonShape.material = material;

		cannonShape.collisionResponse = !this.isTrigger;

		// Get transform from entity
		var entity = this.entity;
		var transform = entity.transformComponent.sync().worldTransform;
		var position = new CANNON.Vec3();
		var quaternion = new CANNON.Quaternion();
		position.copy(transform.translation);
		tmpQuat.fromRotationMatrix(transform.rotation);
		quaternion.copy(tmpQuat);

		var body = new CANNON.Body({
			mass: 0,
			position: position,
			quaternion: quaternion
		});
		this.system.cannonWorld.addBody(body);
		this.cannonBody = body;

		// Register it
		this.system._shapeIdToColliderEntityMap.set(cannonShape.id, entity);

		var collider = this.worldCollider;
		if (collider instanceof SphereCollider) {
			cannonShape.radius = collider.radius;
		} else if (collider instanceof BoxCollider) {
			cannonShape.halfExtents.copy(collider.halfExtents);
			cannonShape.updateConvexPolyhedronRepresentation();
		} else if (collider instanceof MeshCollider) {
			var scale = new CANNON.Vec3();
			scale.copy(collider.scale);
			cannonShape.setScale(scale);
		}
		cannonShape.updateBoundingSphereRadius();
		body.computeAABB();
		body.addShape(cannonShape);
		body.aabbNeedsUpdate = true;
	};

	/**
	 * Remove the collider from the physics world. Does the opposite of .initialize()
	 */
	ColliderComponent.prototype.destroy = function () {
		var body = this.cannonBody;
		body.shapes.forEach(function (shape) {
			this.system._shapeIdToColliderEntityMap.delete(shape.id);
		}.bind(this));
		this.system.cannonWorld.removeBody(body);
		this.cannonBody = null;
		this.cannonShape = null;
	};

	ColliderComponent.numCylinderSegments = 10;

	/**
	 * Create a CANNON.Shape given a Collider. A BoxCollider yields a CANNON.Box and so on.
	 * @param {Collider} collider
	 * @returns {CANNON.Shape}
	 * @hidden
	 */
	ColliderComponent.getCannonShape = function (collider) {
		var shape;
		if (collider instanceof BoxCollider) {
			var halfExtents = new CANNON.Vec3();
			halfExtents.copy(collider.halfExtents);
			shape = new CANNON.Box(halfExtents);
		} else if (collider instanceof SphereCollider) {
			shape = new CANNON.Sphere(collider.radius);
		} else if (collider instanceof PlaneCollider) {
			shape = new CANNON.Plane();
		} else if (collider instanceof CylinderCollider) {
			shape = new CANNON.Cylinder(
				collider.radius,
				collider.radius,
				collider.height,
				ColliderComponent.numCylinderSegments
			);
			var quat = new CANNON.Quaternion();
			quat.setFromAxisAngle(new Vector3(0, 0, 1), -Math.PI / 2);
			shape.transformAllPoints(new Vector3(), quat);
			shape.computeEdges();
			shape.updateBoundingSphereRadius();
		} else if (collider instanceof MeshCollider) {
			// Assume triangles
			if (collider.meshData.indexModes[0] !== 'Triangles') {
				throw new Error('MeshCollider data must be a triangle mesh!');
			}
			shape = new CANNON.Trimesh(
				collider.meshData.getAttributeBuffer('POSITION'),
				collider.meshData.getIndexBuffer()
			);
		} else {
			console.warn('Unhandled collider: ', collider);
		}
		return shape;
	};

	/**
	 * @private
	 * @param  {Object} obj
	 * @param  {Entity} entity
	 * @returns {boolean}
	 */
	ColliderComponent.applyOnEntity = function (obj, entity) {
		if (obj instanceof Collider) {
			entity.setComponent(new ColliderComponent({
				collider: obj
			}));
			return true;
		}
	};

	module.exports = ColliderComponent;


/***/ },

/***/ 455:
/***/ function(module, exports, __webpack_require__) {

	var AbstractRigidBodyComponent = __webpack_require__(453);
	var Vector3 = __webpack_require__(8);
	var Quaternion = __webpack_require__(23);
	var BoxCollider = __webpack_require__(446);
	var SphereCollider = __webpack_require__(451);
	var MeshCollider = __webpack_require__(449);
	var BallJoint = __webpack_require__(456);
	var HingeJoint = __webpack_require__(458);
	var ColliderComponent = __webpack_require__(454);
	var MathUtils = __webpack_require__(9);

	/* global CANNON */
	var tmpQuat = new Quaternion();
	var tmpCannonVec;
	var tmpCannonVec2;

	/**
	 * Adds rigid body dynamics the entity. To be used with the {@link PhysicsSystem}. If the entity or its children have {@link ColliderComponent}s, they are added as collision shapes to the rigid body.
	 * @param {Object} [settings]
	 * @param {number} [settings.mass=1]
	 * @param {boolean} [settings.isKinematic=false]
	 * @param {Vector3} [settings.velocity]
	 * @param {Vector3} [settings.angularVelocity]
	 * @param {number} [settings.linearDamping=0.01]
	 * @param {number} [settings.angularDamping=0.05]
	 * @extends AbstractRigidBodyComponent
	 */
	function RigidBodyComponent(settings) {
		settings = settings || {};
		AbstractRigidBodyComponent.apply(this, arguments);

		this.type = 'RigidBodyComponent';

		/**
		 * @type {CANNON.Body}
		 */
		this.cannonBody = null;

		/**
		 * If true, the Cannon.js body is re-initialized in the next process().
		 * @private
		 * @type {boolean}
		 */
		this._dirty = true;

		/**
		 * @private
		 * @type {boolean}
		 */
		this._isKinematic = !!settings.isKinematic;

		/**
		 * @private
		 * @type {number}
		 */
		this._mass = settings.mass !== undefined ? settings.mass : 1.0;
		if (this._isKinematic) {
			this._mass = 0;
		} else if (this._mass === 0) {
			this._isKinematic = true;
		}

		/**
		 * @private
		 * @type {boolean}
		 */
		this._initialized = false;

		/**
		 * @private
		 * @type {Vector3}
		 */
		this._velocity = settings.velocity ? settings.velocity.clone() : new Vector3();

		/**
		 * @private
		 * @type {Vector3}
		 */
		this._angularVelocity = settings.angularVelocity ? settings.angularVelocity.clone() : new Vector3();

		/**
		 * @private
		 * @type {number}
		 */
		this._linearDamping = settings.linearDamping !== undefined ? settings.linearDamping : 0.01;

		/**
		 * @private
		 * @type {number}
		 */
		this._angularDamping = settings.angularDamping !== undefined ? settings.angularDamping : 0.05;

		/**
		 * @private
		 * @type {number}
		 */
		this._sleepingThreshold = settings.sleepingThreshold !== undefined ? settings.sleepingThreshold : 0.2;

		/**
		 * @private
		 * @type {number}
		 */
		this._sleepingTimeLimit = settings.sleepingTimeLimit !== undefined ? settings.sleepingTimeLimit : 1;

		if (!tmpCannonVec) {
			tmpCannonVec = new CANNON.Vec3();
			tmpCannonVec2 = new CANNON.Vec3();
		}

		/**
		 * All the attached colliders.
		 * @type {Array}
		 */
		this._colliderEntities = [];

		/**
		 * How smoothing of the rigid body movement should be done. Set it to {@link RigidBodyComponent.NONE} or {@link RigidBodyComponent.INTERPOLATE}.
		 * @type {number}
		 */
		this.interpolation = RigidBodyComponent.INTERPOLATE;

		/**
		 * Constraint the movement of the rigid body. Set it to RigidBodyComponent.FREEZE_NONE, RigidBodyComponent.FREEZE_POSITION_X, RigidBodyComponent.FREEZE_POSITION_Y, RigidBodyComponent.FREEZE_POSITION_Z, RigidBodyComponent.FREEZE_ROTATION_X, RigidBodyComponent.FREEZE_ROTATION_Y, RigidBodyComponent.FREEZE_ROTATION_Z, RigidBodyComponent.FREEZE_POSITION, RigidBodyComponent.FREEZE_ROTATION or RigidBodyComponent.FREEZE_ALL.
		 *
		 * @type {number}
		 */
		this._constraints = RigidBodyComponent.FREEZE_NONE;
	}

	RigidBodyComponent.prototype = Object.create(AbstractRigidBodyComponent.prototype);
	RigidBodyComponent.prototype.constructor = RigidBodyComponent;

	RigidBodyComponent.type = 'RigidBodyComponent';

	/**
	 * No constraints.
	 * @type {number}
	 */
	RigidBodyComponent.FREEZE_NONE = 0;

	/**
	 * Freeze motion along the X-axis.
	 * @type {number}
	 */
	RigidBodyComponent.FREEZE_POSITION_X = 1;

	/**
	 * Freeze motion along the Y-axis.
	 * @type {number}
	 */
	RigidBodyComponent.FREEZE_POSITION_Y = 2;

	/**
	 * Freeze motion along the Z-axis.
	 * @type {number}
	 */
	RigidBodyComponent.FREEZE_POSITION_Z = 4;

	/**
	 * Freeze rotation along the X-axis.
	 * @type {number}
	 */
	RigidBodyComponent.FREEZE_ROTATION_X = 8;

	/**
	 * Freeze rotation along the Y-axis.
	 * @type {number}
	 */
	RigidBodyComponent.FREEZE_ROTATION_Y = 16;

	/**
	 * Freeze rotation along the Z-axis.
	 * @type {number}
	 */
	RigidBodyComponent.FREEZE_ROTATION_Z = 32;

	/**
	 * Freeze motion along all axes.
	 * @type {number}
	 */
	RigidBodyComponent.FREEZE_POSITION = RigidBodyComponent.FREEZE_POSITION_X | RigidBodyComponent.FREEZE_POSITION_Y | RigidBodyComponent.FREEZE_POSITION_Z;

	/**
	 * Freeze rotation along all axes.
	 * @type {number}
	 */
	RigidBodyComponent.FREEZE_ROTATION = RigidBodyComponent.FREEZE_ROTATION_X | RigidBodyComponent.FREEZE_ROTATION_Y | RigidBodyComponent.FREEZE_ROTATION_Z;

	/**
	 * Freeze rotation and motion along all axes.
	 * @type {number}
	 */
	RigidBodyComponent.FREEZE_ALL = RigidBodyComponent.FREEZE_POSITION | RigidBodyComponent.FREEZE_ROTATION;

	/**
	 * No rigid body smoothing.
	 */
	RigidBodyComponent.NONE = 1;

	/**
	 * Transform is smoothed based on the Transform of the previous frame.
	 */
	RigidBodyComponent.INTERPOLATE = 2;
	//! SH: Making room for future "EXTRAPOLATE"

	/**
	 * Cannon.js uses ConvexPolyhedron shapes for collision checking sometimes (for example, for cylinders). Therefore it needs a number of segments to use.
	 * @type {number}
	 */
	RigidBodyComponent.numCylinderSegments = 10;

	/**
	 * Get the world transform from the entity and set on the body
	 * @private
	 * @param {Entity} entity
	 */
	RigidBodyComponent.prototype.setTransformFromEntity = function (entity) {
		var transform = entity.transformComponent.sync().worldTransform;
		var body = this.cannonBody;
		body.position.copy(transform.translation);
		body.previousPosition.copy(transform.translation);
		body.interpolatedPosition.copy(transform.translation);
		tmpQuat.fromRotationMatrix(transform.rotation);
		body.quaternion.copy(tmpQuat);
		body.previousQuaternion.copy(tmpQuat);
		body.interpolatedQuaternion.copy(tmpQuat);
	};

	/**
	 * Apply a world-oriented force to a world point.
	 * @param {Vector3} force The force vector, oriented in world space.
	 * @param {Vector3} worldPoint Where to apply the force, in world space.
	 * @example
	 * var direction = new Vector3();
	 * direction
	 *     .copy(entity.transformComponent.worldTransform.translation)
	 *     .sub(bombEntity.transformComponent.worldTransform.translation)
	 *     .normalize()
	 *     .scale(100);
	 * entity.applyForceWorld(direction, entity.transformComponent.worldTransform.translation);
	 */
	RigidBodyComponent.prototype.applyForceWorld = function (force, worldPoint) {
		var cannonForce = tmpCannonVec;
		cannonForce.copy(force);

		var cannonPoint = tmpCannonVec2;
		cannonPoint.copy(worldPoint);
		cannonPoint.vsub(this.cannonBody.position, cannonPoint);

		this.cannonBody.applyForce(cannonForce, cannonPoint);
	};

	/**
	 * Apply a local force to the body in local body space.
	 * @param {Vector3} force The force vector, oriented in local space.
	 * @param {Vector3} [relativePoint] Where to apply the force. This point is relative to the Body, oriented in local space. Defaults to the zero vector (the center of mass).
	 * @example
	 * var localThrusterForce = new Vector3(0, 0, 1); // Thrust in forward direction of ship
	 * var localPosition = new Vector3(0, 0, -1); // Applies to the back part of the ship
	 * shapeShip.rigidBodyComponent.applyForce(localThrusterForce, localPosition);
	 */
	RigidBodyComponent.prototype.applyForceLocal = function (force, relativePoint) {
		var cannonForce = tmpCannonVec;
		cannonForce.copy(force);

		var cannonPoint = CANNON.Vec3.ZERO;
		if (relativePoint) {
			cannonPoint = tmpCannonVec2;
			cannonPoint.copy(relativePoint);
		}

		var body = this.cannonBody;

		// Transform the vectors to world space
		body.vectorToWorldFrame(cannonForce, cannonForce);
		body.vectorToWorldFrame(cannonPoint, cannonPoint);

		body.applyForce(cannonForce, cannonPoint);
	};

	/**
	 * Apply a force to a point on the body in world space.
	 * @param {Vector3} force The force vector, oriented in world space.
	 * @param {Vector3} [relativePoint] Where to apply the force. This point is relative to the Body, oriented in World space. Defaults to the zero vector (the center of mass).
	 */
	RigidBodyComponent.prototype.applyForce = function (force, relativePoint) {
		var cannonForce = tmpCannonVec;
		cannonForce.copy(force);

		var cannonPoint = CANNON.Vec3.ZERO;
		if (relativePoint) {
			cannonPoint = tmpCannonVec2;
			cannonPoint.copy(relativePoint);
		}

		this.cannonBody.applyForce(cannonForce, cannonPoint);
	};

	/**
	 * Apply a torque to a point on the body in world space.
	 * @param {Vector3} torque The torque vector, oriented in world space.
	 */
	RigidBodyComponent.prototype.applyTorque = function (torque) {
		tmpCannonVec.copy(torque);
		this.cannonBody.torque.vadd(tmpCannonVec, this.cannonBody.torque);
	};

	/**
	 * Apply a torque to the body in local body space.
	 * @param {Vector3} torque The torque vector, oriented in local body space.
	 */
	RigidBodyComponent.prototype.applyTorqueLocal = function (torque) {
		var cannonTorque = tmpCannonVec;
		cannonTorque.copy(torque);

		// Transform to world space
		this.cannonBody.vectorToWorldFrame(cannonTorque, cannonTorque);
		this.cannonBody.torque.vadd(cannonTorque, this.cannonBody.torque);
	};

	/**
	 * Apply an impulse to the body.
	 * @param {Vector3} impulse The impulse vector, oriented in world space.
	 * @param {Vector3} relativePoint Where the impulse should be applied
	 */
	RigidBodyComponent.prototype.applyImpulse = function (impulse, relativePoint) {
		tmpCannonVec.copy(impulse);
		tmpCannonVec2.copy(relativePoint);
		this.cannonBody.applyImpulse(tmpCannonVec, tmpCannonVec2);
	};

	/**
	 * Apply an impulse to the center of mass of the body.
	 * @param {Vector3} impulse The force vector, oriented in local space.
	 * @param {Vector3} relativePoint
	 */
	RigidBodyComponent.prototype.applyImpulseLocal = function (impulse, relativePoint) {
		tmpCannonVec.copy(impulse);
		tmpCannonVec2.copy(relativePoint);
		this.cannonBody.applyLocalImpulse(tmpCannonVec, tmpCannonVec2);
	};

	/**
	 * @param {Vector3} velocity
	 */
	RigidBodyComponent.prototype.setVelocity = function (velocity) {
		if (this.cannonBody) {
			this.cannonBody.velocity.copy(velocity);
		}
		this._velocity.set(velocity);
	};

	/**
	 * @param {Vector3} targetVector
	 */
	RigidBodyComponent.prototype.getVelocity = function (targetVector) {
		var body = this.cannonBody;
		var velocity = body ? body.velocity : this._velocity;
		targetVector.setDirect(velocity.x, velocity.y, velocity.z);
	};

	/**
	 * @param {Vector3} angularVelocity
	 */
	RigidBodyComponent.prototype.setAngularVelocity = function (angularVelocity) {
		if (this.cannonBody) {
			this.cannonBody.angularVelocity.copy(angularVelocity);
		}
		this._angularVelocity.set(angularVelocity);
	};

	/**
	 * @param {Vector3} targetVector
	 */
	RigidBodyComponent.prototype.getAngularVelocity = function (targetVector) {
		var body = this.cannonBody;
		var angularVelocity = body ? body.angularVelocity : this._angularVelocity;
		targetVector.setDirect(angularVelocity.x, angularVelocity.y, angularVelocity.z);
	};

	/**
	 * @param {Vector3} position
	 */
	RigidBodyComponent.prototype.setPosition = function (position) {
		if (this.cannonBody) {
			this.cannonBody.position.copy(position);
		}
	};

	/**
	 * @param {Vector3} targetVector
	 */
	RigidBodyComponent.prototype.getPosition = function (targetVector) {
		if (this.cannonBody) {
			var position = this.cannonBody.position;
			targetVector.setDirect(position.x, position.y, position.z);
		}
	};

	/**
	 * Get the interpolated position from the rigid body. Use this for rendering. The resulting vector is a linear interpolation between the current and previous physics position, that matches the current rendering frame.
	 * @param {Vector3} targetVector
	 */
	RigidBodyComponent.prototype.getInterpolatedPosition = function (targetVector) {
		if (!this.cannonBody) {
			return;
		}

		var prevPosition = this.cannonBody.previousPosition;
		var currentPosition = this.cannonBody.position;
		var t = this._system.world.interpolationTime;
		targetVector.setDirect(
			MathUtils.lerp(t, prevPosition.x, currentPosition.x),
			MathUtils.lerp(t, prevPosition.y, currentPosition.y),
			MathUtils.lerp(t, prevPosition.z, currentPosition.z)
		);
	};

	/**
	 * @param {Quaternion} quaternion
	 */
	RigidBodyComponent.prototype.setQuaternion = function (quaternion) {
		if (this.cannonBody) {
			this.cannonBody.quaternion.copy(quaternion);
		}
	};

	/**
	 * @param {Quaternion} targetQuat
	 */
	RigidBodyComponent.prototype.getQuaternion = function (targetQuat) {
		if (this.cannonBody) {
			var cannonQuaternion = this.cannonBody.quaternion;
			targetQuat.setDirect(
				cannonQuaternion.x,
				cannonQuaternion.y,
				cannonQuaternion.z,
				cannonQuaternion.w
			);
		}
	};

	/**
	 * Get the interpolated quaternion from the rigid body. Use this for rendering. The resulting quaternion is a spherical interpolation between the current and previous physics position, that matches the current rendering frame.
	 * @param {Quaternion} targetQuat
	 */
	RigidBodyComponent.prototype.getInterpolatedQuaternion = function (targetQuat) {
		if (!this.cannonBody) {
			return;
		}

		var prevQuat = this.cannonBody.previousQuaternion;
		var currentQuat = this.cannonBody.quaternion;
		var t = this._system.world.interpolationTime;
		targetQuat.setDirect(
			MathUtils.lerp(t, prevQuat.x, currentQuat.x),
			MathUtils.lerp(t, prevQuat.y, currentQuat.y),
			MathUtils.lerp(t, prevQuat.z, currentQuat.z),
			MathUtils.lerp(t, prevQuat.w, currentQuat.w)
		);
	};

	Object.defineProperties(RigidBodyComponent.prototype, {

		/**
		 * @target-class RigidBodyComponent linearDamping member
		 * @type {number}
		 */
		linearDamping: {
			get: function () {
				return this._linearDamping;
			},
			set: function (value) {
				if (this.cannonBody) {
					this.cannonBody.linearDamping = value;
				}
				this._linearDamping = value;
			}
		},

		/**
		 * @target-class RigidBodyComponent angularDamping member
		 * @type {number}
		 */
		angularDamping: {
			get: function () {
				return this._angularDamping;
			},
			set: function (value) {
				if (this.cannonBody) {
					this.cannonBody.angularDamping = value;
				}
				this._angularDamping = value;
			}
		},

		/**
		 * @target-class RigidBodyComponent isKinematic member
		 * @type {number}
		 */
		isKinematic: {
			get: function () {
				return this._isKinematic;
			},
			set: function (value) {
				this._isKinematic = value;
				if (this.cannonBody) {
					this.cannonBody.type = value ? CANNON.Body.KINEMATIC : CANNON.Body.DYNAMIC;
					this.cannonBody.updateMassProperties();
				}
			}
		},

		/**
		 * @target-class RigidBodyComponent sleepingThreshold member
		 * @type {number}
		 */
		sleepingThreshold: {
			get: function () {
				return this._sleepingThreshold;
			},
			set: function (value) {
				this._sleepingThreshold = value;
				if (this.cannonBody) {
					this.cannonBody.sleepSpeedLimit = value;
				}
			}
		},

		/**
		 * @target-class RigidBodyComponent mass member
		 * @type {number}
		 */
		mass: {
			get: function () {
				return this._mass;
			},
			set: function (value) {
				this._mass = value;
				if (this.cannonBody) {
					this.cannonBody.mass = value;
					this.cannonBody.updateMassProperties();
				}
			}
		},

		/**
		 * @target-class RigidBodyComponent sleepingTimeLimit member
		 * @type {number}
		 */
		sleepingTimeLimit: {
			get: function () {
				return this._sleepingTimeLimit;
			},
			set: function (value) {
				this._sleepingTimeLimit = value;
				if (this.cannonBody) {
					this.cannonBody.sleepTimeLimit = value;
				}
			}
		},

		/**
		 * Constraint the movement of the rigid body. Set it to RigidBodyComponent.FREEZE_NONE, RigidBodyComponent.FREEZE_POSITION_X, RigidBodyComponent.FREEZE_POSITION_Y, RigidBodyComponent.FREEZE_POSITION_Z, RigidBodyComponent.FREEZE_ROTATION_X, RigidBodyComponent.FREEZE_ROTATION_Y, RigidBodyComponent.FREEZE_ROTATION_Z, RigidBodyComponent.FREEZE_POSITION, RigidBodyComponent.FREEZE_ROTATION or RigidBodyComponent.FREEZE_ALL.
		 * @target-class RigidBodyComponent constraints member
		 * @type {number}
		 */
		constraints: {
			get: function () {
				return this._constraints;
			},
			set: function (value) {
				this._constraints = value;
				var body = this.cannonBody;
				if (body) {
					RigidBodyComponent.constraintsToCannonFactors(value, body.linearFactor, body.angularFactor);
				}
			}
		}
	});

	/**
	 * Removes the body from the physics engine
	 */
	RigidBodyComponent.prototype.destroy = function () {
		var body = this.cannonBody;
		if (body) {
			body.world.removeBody(body);
			delete this._system._entities[body.id];
			body.shapes.forEach(function (shape) {
				this._system._shapeIdToColliderEntityMap.delete(shape.id);
			}.bind(this));
			this.cannonBody = null;
		}

		// Remove references to colliders
		for (var i = 0; i < this._colliderEntities.length; i++) {
			this._colliderEntities[i].bodyEntity = null;
		}
		this._colliderEntities.length = 0;
	};

	RigidBodyComponent.constraintsToCannonFactors = function (constraints, linear, angular) {
		linear.set(
			constraints & RigidBodyComponent.FREEZE_POSITION_X ? 0 : 1,
			constraints & RigidBodyComponent.FREEZE_POSITION_Y ? 0 : 1,
			constraints & RigidBodyComponent.FREEZE_POSITION_Z ? 0 : 1
		);
		angular.set(
			constraints & RigidBodyComponent.FREEZE_ROTATION_X ? 0 : 1,
			constraints & RigidBodyComponent.FREEZE_ROTATION_Y ? 0 : 1,
			constraints & RigidBodyComponent.FREEZE_ROTATION_Z ? 0 : 1
		);
	};

	/**
	 * Initialize the Cannon.js body available in the .cannonBody property. This is useful if the intention is to work with the CANNON.Body instance directly after the component is created.
	 */
	RigidBodyComponent.prototype.initialize = function () {
		this.destroy();

		var body = this.cannonBody = new CANNON.Body({
			mass: this._mass,
			linearDamping: this._linearDamping,
			angularDamping: this._angularDamping,
			sleepSpeedLimit: this._sleepingThreshold,
			sleepTimeLimit: this._sleepingTimeLimit
		});
		RigidBodyComponent.constraintsToCannonFactors(this.constraints, body.linearFactor, body.angularFactor);
		this._system.cannonWorld.addBody(body);
		this._system._entities[body.id] = this._entity;

		if (!this._initialized) {
			body.velocity.copy(this._velocity);
			body.angularVelocity.copy(this._angularVelocity);
		}

		this.traverseColliders(this._entity, function (colliderEntity, collider, position, quaternion) {
			this.addCollider(colliderEntity, position, quaternion);
			colliderEntity.colliderComponent.bodyEntity = this._entity;
		});
		if (this._isKinematic) {
			body.type = CANNON.Body.KINEMATIC;
		}
		this.setTransformFromEntity(this._entity);
		body.aabbNeedsUpdate = true;
		this.emitInitialized(this._entity);
	};

	/**
	 * @hidden
	 */
	RigidBodyComponent.prototype.initializeJoint = function (joint) {
		var bodyA = this.cannonBody;
		var bodyB = (joint.connectedEntity.rigidBodyComponent || joint.connectedEntity.colliderComponent).cannonBody;
		var constraint;
		if (joint instanceof BallJoint) {
			// Scale the joint to the world scale
			var scaledPivotA = joint.localPivot.clone();
			scaledPivotA.mul(this._entity.transformComponent.transform.scale);

			var pivotInA = new CANNON.Vec3();
			var pivotInB = new CANNON.Vec3();
			pivotInA.copy(scaledPivotA);

			if (joint.autoConfigureConnectedPivot) {
				// Get the local pivot in bodyB
				bodyA.pointToWorldFrame(pivotInA, pivotInB);
				bodyB.pointToLocalFrame(pivotInB, pivotInB);
			} else {
				var worldScaledPivotB = joint.connectedLocalPivot.clone();
				worldScaledPivotB.mul(joint.connectedEntity.transformComponent.transform.scale);
				pivotInB.copy(worldScaledPivotB);
			}

			constraint = new CANNON.PointToPointConstraint(bodyA, pivotInA, bodyB, pivotInB);
		} else if (joint instanceof HingeJoint) {
			var pivotInA = new CANNON.Vec3();
			var pivotInB = new CANNON.Vec3();
			var axisInA = new CANNON.Vec3();
			var axisInB = new CANNON.Vec3();

			// Scale the joint to the world scale
			var scaledPivotA = joint.localPivot.clone();
			scaledPivotA.mul(this._entity.transformComponent.transform.scale);

			// Copy it to cannon vectors
			pivotInA.copy(scaledPivotA);
			axisInA.copy(joint.localAxis);

			if (joint.autoConfigureConnectedPivot) {
				// Get the local pivot in bodyB
				bodyA.pointToWorldFrame(pivotInA, pivotInB);
				bodyB.pointToLocalFrame(pivotInB, pivotInB);
			} else {
				var worldScaledPivotB = joint.connectedLocalPivot.clone();
				worldScaledPivotB.mul(joint.connectedEntity.transformComponent.transform.scale);
				pivotInB.copy(worldScaledPivotB);
			}

			// The axis remains unscaled
			axisInB.copy(joint.localAxis);

			// Get the local axis in bodyB
			bodyA.vectorToWorldFrame(joint.localAxis, axisInB);
			bodyB.vectorToLocalFrame(axisInB, axisInB);

			constraint = new CANNON.HingeConstraint(bodyA, bodyB, {
				pivotA: pivotInA,
				pivotB: pivotInB,
				axisA: axisInA,
				axisB: axisInB,
				collideConnected: joint.collideConnected
			});
		} else {
			console.warn('Unhandled joint: ', joint);
		}

		if (constraint) {
			bodyA.world.addConstraint(constraint);
			joint.cannonJoint = constraint;
		}
	};

	RigidBodyComponent.copyScaleFromColliderToCannonShape = function (cannonShape, collider) {
		if (collider instanceof SphereCollider) {
			cannonShape.radius = collider.radius;
		} else if (collider instanceof BoxCollider) {
			cannonShape.halfExtents.copy(collider.halfExtents);
			cannonShape.updateConvexPolyhedronRepresentation();
			cannonShape.updateBoundingSphereRadius();
		} else if (collider instanceof MeshCollider) {
			var scale;
			if (!tmpCannonVec) {
				tmpCannonVec = new CANNON.Vec3();
			}
			scale = tmpCannonVec;
			scale.copy(collider.scale);
			cannonShape.setScale(scale);
		}
		cannonShape.updateBoundingSphereRadius();
	};

	/**
	 * @hidden
	 */
	RigidBodyComponent.prototype.destroyJoint = function (joint) {
		var body = this.cannonBody;
		if (body && joint.cannonJoint) {
			body.world.removeConstraint(joint.cannonJoint);
			joint.cannonJoint = null;
		}
	};

	/**
	 * @private
	 */
	RigidBodyComponent.prototype.addCollider = function (entity, position, quaternion) {
		var body = this.cannonBody;
		var colliderComponent = entity.colliderComponent;
		colliderComponent.updateWorldCollider(true);
		var collider = colliderComponent.worldCollider;

		var cannonShape = colliderComponent.cannonShape = ColliderComponent.getCannonShape(collider);

		this._system._shapeIdToColliderEntityMap.set(cannonShape.id, entity);

		// Create a material for the shape
		var mat = new CANNON.Material();
		mat.friction = colliderComponent.material ? colliderComponent.material.friction : -1;
		mat.restitution = colliderComponent.material ? colliderComponent.material.restitution : -1;
		cannonShape.material = mat;

		cannonShape.collisionResponse = !colliderComponent.isTrigger;

		// Add the shape
		var cannonPos = new CANNON.Vec3();
		if (position) {
			cannonPos.copy(position);
		}
		var cannonQuat = new CANNON.Quaternion();
		if (position) {
			cannonQuat.copy(quaternion);
		}
		body.addShape(cannonShape, cannonPos, cannonQuat);

		this._colliderEntities.push(entity);
	};

	/**
	 * Creates a new instance indentical to this component.
	 * @returns RigidBodyComponent
	 */
	RigidBodyComponent.prototype.clone = function () {
		return new RigidBodyComponent({
			isKinematic: this._isKinematic,
			mass: this._mass,
			velocity: this._velocity,
			angularVelocity: this._angularVelocity,
			linearDamping: this._linearDamping,
			angularDamping: this._angularDamping,
			sleepingThreshold: this._sleepingThreshold,
			sleepingTimeLimit: this._sleepingTimeLimit
		});
	};

	RigidBodyComponent.prototype.api = {};

	module.exports = RigidBodyComponent;

/***/ },

/***/ 456:
/***/ function(module, exports, __webpack_require__) {

	var PhysicsJoint = __webpack_require__(457);
	var Vector3 = __webpack_require__(8);

	/**
	 * A physics ball joint. A ball joint (or "constraint") will try to keep a point in each of two connected bodies the same.
	 * @param {Object} [settings]
	 * @param {Vector3} [settings.localPivot]
	 * @param {Entity} [settings.connectedEntity]
	 * @param {boolean} [settings.collideConnected=false]
	 * @extends PhysicsJoint
	 */
	function BallJoint(settings) {
		settings = settings || {};
		PhysicsJoint.call(this, settings);

		/**
		 * @type {Vector3}
		 */
		this.localPivot = settings.localPivot ? Vector3.fromAny(settings.localPivot) : new Vector3(0, 0.5, 0);

		/**
		 * Automatically compute the connectedLocalPivot by using the entities initial transforms.
		 * @type {boolean}
		 * @default true
		 */
		this.autoConfigureConnectedPivot = settings.autoConfigureConnectedPivot ? settings.autoConfigureConnectedPivot : true;

		/**
		 * The pivot point defined inside the connected entity.
		 * @type {Vector3}
		 */
		this.connectedLocalPivot = settings.connectedLocalPivot ? Vector3.fromAny(settings.connectedLocalPivot) : new Vector3(0, 0.5, 0);
	}

	BallJoint.prototype = Object.create(PhysicsJoint.prototype);
	BallJoint.prototype.constructor = BallJoint;

	module.exports = BallJoint;


/***/ },

/***/ 457:
/***/ function(module, exports) {

	/**
	 * Base class for physics joints, for example hinge or balljoint.
	 * @param {Object} [settings]
	 * @param {Entity} [settings.connectedEntity]
	 * @param {boolean} [settings.collideConnected=false]
	 */
	function PhysicsJoint(settings) {
		settings = settings || {};

		/**
		 * The entity connected
		 * @type {Entity}
		 */
		this.connectedEntity = settings.connectedEntity || null;

		/**
		 * Indicates if the connected entities should collide.
		 * @type {boolean}
		 */
		this.collideConnected = settings.collideConnected !== undefined ? settings.collideConnected : false;
	}

	module.exports = PhysicsJoint;


/***/ },

/***/ 458:
/***/ function(module, exports, __webpack_require__) {

	var PhysicsJoint = __webpack_require__(457);
	var Vector3 = __webpack_require__(8);

	/**
	 * Physics hinge joint. To be added to a {@link RigidBodyComponent}.
	 * @param {Object} [settings]
	 * @param {Vector3} [settings.localPivot]
	 * @param {Vector3} [settings.localAxis]
	 * @param {Entity} [settings.connectedEntity]
	 * @param {boolean} [settings.collideConnected=false]
	 * @extends PhysicsJoint
	 */
	function HingeJoint(settings) {
		settings = settings || {};
		PhysicsJoint.call(this, settings);

		/**
		 * A point defined locally in the entity that the Hinge should rotate around.
		 * @type {Vector3}
		 */
		this.localPivot = settings.localPivot ? new Vector3(settings.localPivot) : new Vector3(0, 0.5, 0);

		/**
		 * Automatically compute the connectedLocalPivot
		 * @type {boolean}
		 * @default true
		 */
		this.autoConfigureConnectedPivot = settings.autoConfigureConnectedPivot ? settings.autoConfigureConnectedPivot : true;

		/**
		 * The pivot point defined inside the connected entity.
		 * @type {Vector3}
		 */
		this.connectedLocalPivot = settings.connectedLocalPivot ? new Vector3(settings.connectedLocalPivot) : new Vector3();

		/**
		 * @type {Vector3}
		 */
		this.localAxis = settings.localAxis ? new Vector3(settings.localAxis) : new Vector3(1, 0, 0);
	}
	HingeJoint.prototype = Object.create(PhysicsJoint.prototype);
	HingeJoint.prototype.constructor = HingeJoint;

	module.exports = HingeJoint;


/***/ },

/***/ 459:
/***/ function(module, exports, __webpack_require__) {

	var ComponentHandler = __webpack_require__(88);
	var ColliderComponent = __webpack_require__(454);
	var ObjectUtils = __webpack_require__(6);
	var SphereCollider = __webpack_require__(451);
	var BoxCollider = __webpack_require__(446);
	var PlaneCollider = __webpack_require__(450);
	var CylinderCollider = __webpack_require__(448);
	var PhysicsMaterial = __webpack_require__(460);

	/**
	 * For handling loading of collider components
	 * @extends ComponentHandler
	 * @hidden
	 */
	function ColliderComponentHandler() {
		ComponentHandler.apply(this, arguments);
		this._type = 'ColliderComponent';
	}

	ColliderComponentHandler.prototype = Object.create(ComponentHandler.prototype);
	ColliderComponentHandler.prototype.constructor = ColliderComponentHandler;
	ComponentHandler._registerClass('collider', ColliderComponentHandler);

	/**
	 * Prepare component. Set defaults on config here.
	 * @param {Object} config
	 * @returns {Object}
	 * @private
	 */
	ColliderComponentHandler.prototype._prepare = function (config) {
		return ObjectUtils.defaults(config, {
			shape: 'Box',
			shapeOptions: {
				halfExtents: [1, 1, 1],
				radius: 0.5,
				height: 1
			},
			isTrigger: false,
			friction: 0.3,
			restitution: 0.0
		});
	};

	/**
	 * Create collider component.
	 * @returns {ColliderComponent} the created component object
	 * @private
	 */
	ColliderComponentHandler.prototype._create = function () {
		return new ColliderComponent({ material: new PhysicsMaterial() });
	};

	/**
	 * Removes the collider component
	 * @param {string} ref
	 */
	ColliderComponentHandler.prototype._remove = function (entity) {
		entity.clearComponent('ColliderComponent');
	};

	/**
	 * Update engine collider component object based on the config.
	 * @param {Entity} entity The entity on which this component should be added.
	 * @param {Object} config
	 * @param {Object} options
	 * @returns {RSVP.Promise} promise that resolves with the component when loading is done.
	 */
	ColliderComponentHandler.prototype.update = function (entity, config, options) {
		return ComponentHandler.prototype.update.call(this, entity, config, options).then(function (component) {
			if (!component) { return; }

			switch (config.shape) {
			default:
			case 'Box':
				component.collider = new BoxCollider(config.shapeOptions);
				component.worldCollider = new BoxCollider();
				break;
			case 'Sphere':
				component.collider = new SphereCollider(config.shapeOptions);
				component.worldCollider = new SphereCollider();
				break;
			case 'Plane':
				component.collider = new PlaneCollider();
				component.worldCollider = new PlaneCollider();
				break;
			case 'Cylinder':
				component.collider = new CylinderCollider(config.shapeOptions);
				component.worldCollider = new CylinderCollider();
				break;
			}

			component.material.friction = config.friction;
			component.material.restitution = config.restitution;
			component.isTrigger = config.isTrigger;

			return component;
		});
	};

	module.exports = ColliderComponentHandler;


/***/ },

/***/ 460:
/***/ function(module, exports) {

	/**
	 * @param {Object} [settings]
	 * @param {number} [settings.friction=0.3]
	 * @param {number} [settings.restitution=0]
	 */
	function PhysicsMaterial(settings) {
		settings = settings || {};

		/**
		 * The friction coefficient. Multiplication is used to combine two friction values.
		 * @type {number}
		 */
		this.friction = settings.friction !== undefined ? settings.friction : 0.3;

		/**
		 * The "bounciness" of the collider.
		 * @type {number}
		 */
		this.restitution = settings.restitution !== undefined ? settings.restitution : 0;
	}

	module.exports = PhysicsMaterial;


/***/ },

/***/ 461:
/***/ function(module, exports, __webpack_require__) {

	var ComponentHandler = __webpack_require__(88);
	var RigidBodyComponent = __webpack_require__(455);
	var ObjectUtils = __webpack_require__(6);
	var Vector3 = __webpack_require__(8);

	/**
	 * For handling loading of rigid body components
	 * @extends ComponentHandler
	 * @hidden
	 */
	function RigidBodyComponentHandler() {
		ComponentHandler.apply(this, arguments);
		this._type = 'RigidBodyComponent';
	}

	RigidBodyComponentHandler.prototype = Object.create(ComponentHandler.prototype);
	RigidBodyComponentHandler.prototype.constructor = RigidBodyComponentHandler;
	ComponentHandler._registerClass('rigidBody', RigidBodyComponentHandler);

	/**
	 * Prepare component. Set defaults on config here.
	 * @param {Object} config
	 * @returns {Object}
	 * @private
	 */
	RigidBodyComponentHandler.prototype._prepare = function (config) {
		return ObjectUtils.defaults(config, {
			mass: 1,
			isKinematic: false,
			velocity: [0, 0, 0],
			angularVelocity: [0, 0, 0],
			linearDrag: 0,
			angularDrag: 0,
			freezePositionX: false,
			freezePositionY: false,
			freezePositionZ: false,
			freezeRotationX: false,
			freezeRotationY: false,
			freezeRotationZ: false
		});
	};

	/**
	 * Create a rigid body component.
	 * @returns {RigidBodyComponent} the created component object
	 * @private
	 */
	RigidBodyComponentHandler.prototype._create = function () {
		return new RigidBodyComponent();
	};

	/**
	 * Removes the rigid body component
	 * @param {string} ref
	 */
	RigidBodyComponentHandler.prototype._remove = function (entity) {
		entity.clearComponent('RigidBodyComponent');
	};

	/**
	 * Update engine rigid body component object based on the config.
	 * @param {Entity} entity The entity on which this component should be added.
	 * @param {Object} config
	 * @param {Object} options
	 * @returns {RSVP.Promise} promise that resolves with the component when loading is done.
	 */
	RigidBodyComponentHandler.prototype.update = function (entity, config, options) {
		return ComponentHandler.prototype.update.call(this, entity, config, options).then(function (component) {
			if (!component) { return; }

			component.mass = config.mass;
			component.isKinematic = config.isKinematic;
			component.setVelocity(new Vector3(config.velocity));
			component.setAngularVelocity(new Vector3(config.angularVelocity));
			component.linearDamping = config.linearDrag;
			component.angularDamping = config.angularDrag;

			component.constraints = (
				(config.freezePositionX ? RigidBodyComponent.FREEZE_POSITION_X : 0) |
				(config.freezePositionY ? RigidBodyComponent.FREEZE_POSITION_Y : 0) |
				(config.freezePositionZ ? RigidBodyComponent.FREEZE_POSITION_Z : 0) |
				(config.freezeRotationX ? RigidBodyComponent.FREEZE_ROTATION_X : 0) |
				(config.freezeRotationY ? RigidBodyComponent.FREEZE_ROTATION_Y : 0) |
				(config.freezeRotationZ ? RigidBodyComponent.FREEZE_ROTATION_Z : 0)
			);

			return component;
		});
	};

	module.exports = RigidBodyComponentHandler;


/***/ },

/***/ 462:
/***/ function(module, exports, __webpack_require__) {

	var Vector3 = __webpack_require__(8);

	/**
	 * Structure used to get information back from a raycast.
	 * @param {Object} [settings]
	 * @param {Vector3} [settings.normal]
	 * @param {Vector3} [settings.point]
	 * @param {Entity} [settings.entity]
	 * @param {number} [settings.distance]
	 */
	function RaycastResult(settings) {
		settings = settings || {};

		/**
		 * The impact point in world space where the ray hit the collider.
		 * @type {Vector3}
		 */
		this.point = settings.point ? new Vector3(settings.point) : new Vector3();

		/**
		 * The normal of the surface the ray hit.
		 * @type {Vector3}
		 */
		this.normal = settings.normal ? new Vector3(settings.normal) : new Vector3();

		/**
		 * The Collider that was hit.
		 * @type {Entity}
		 */
		this.entity = settings.entity || null;

		/**
		 * The distance from the ray's origin to the impact point.
		 * @type {number}
		 * @default -1
		 */
		this.distance = settings.distance || -1;
	}

	RaycastResult.prototype.reset = function () {
		this.entity = null;
		this.distance = -1;
	};

	module.exports = RaycastResult;

/***/ },

/***/ 463:
/***/ function(module, exports, __webpack_require__) {

	var MeshData = __webpack_require__(14);

	/**
	 * A wireframe mesh indicating the position and orientation of a BoxCollider.
	 * @extends MeshData
	 */
	function PhysicsBoxDebugShape() {
		var attributeMap = MeshData.defaultMap([MeshData.POSITION]);
		MeshData.call(this, attributeMap, 3 * 8, 2 * 4 * 3);
		this.indexModes[0] = 'Lines';
		this.rebuild();
	}
	PhysicsBoxDebugShape.prototype = Object.create(MeshData.prototype);
	PhysicsBoxDebugShape.prototype.constructor = PhysicsBoxDebugShape;

	/**
	 * @returns {PhysicsBoxDebugShape}
	 */
	PhysicsBoxDebugShape.prototype.buildWireframeData = function () {
		return new PhysicsBoxDebugShape();
	};

	/**
	 * @returns {PhysicsBoxDebugShape} self for chaining
	 */
	PhysicsBoxDebugShape.prototype.rebuild = function () {
		var verts = [];
		var indices = [];

		verts.push(
			-0.5, -0.5, -0.5, // 0
			-0.5, -0.5,  0.5, // 1
			-0.5,  0.5,  0.5, // 2
			-0.5,  0.5, -0.5, // 3
			0.5, -0.5, -0.5, // 4
			0.5, -0.5,  0.5, // 5
			0.5,  0.5,  0.5, // 6
			0.5,  0.5, -0.5  // 7
		);

		indices.push(
			0, 1,
			1, 2,
			2, 3,
			3, 0,

			4, 5,
			5, 6,
			6, 7,
			7, 4,

			0, 4,
			1, 5,
			2, 6,
			3, 7
		);

		this.getAttributeBuffer(MeshData.POSITION).set(verts);

		this.getIndexBuffer().set(indices);

		return this;
	};

	module.exports = PhysicsBoxDebugShape;

/***/ },

/***/ 464:
/***/ function(module, exports, __webpack_require__) {

	var MeshData = __webpack_require__(14);

	/**
	 * A wireframe mesh indicating the position and orientation of a CylinderCollider.
	 * @param {number} [numSegments=32]
	 * @extends MeshData
	 */
	function PhysicsCylinderDebugShape(numSegments) {
		numSegments = numSegments || 32;
		var attributeMap = MeshData.defaultMap([MeshData.POSITION]);
		this.numSegments = numSegments;
		MeshData.call(this, attributeMap, 2 * 3 * numSegments + 3 * 8, 2 * 2 * numSegments + 2 * 8);
		this.indexModes[0] = 'Lines';
		this.rebuild();
	}
	PhysicsCylinderDebugShape.prototype = Object.create(MeshData.prototype);
	PhysicsCylinderDebugShape.prototype.constructor = PhysicsCylinderDebugShape;

	/**
	 * @returns {PhysicsCylinderDebugShape}
	 */
	PhysicsCylinderDebugShape.prototype.buildWireframeData = function () {
		return new PhysicsCylinderDebugShape();
	};

	/**
	 * @returns {PhysicsCylinderDebugShape} self for chaining
	 */
	PhysicsCylinderDebugShape.prototype.rebuild = function () {
		var verts = [];
		var indices = [];
		var numSegments = this.numSegments;

		// Around +z
		for (var i = 0; i < numSegments; i++) {
			verts.push(Math.cos(2 * Math.PI * i / numSegments), Math.sin(2 * Math.PI * i / numSegments), 0.5);
			indices.push(i, (i + 1) % numSegments);
		}

		// Around -z
		for (var i = 0; i < numSegments; i++) {
			verts.push(Math.cos(2 * Math.PI * i / numSegments), Math.sin(2 * Math.PI * i / numSegments), -0.5);
			indices.push(numSegments + i, numSegments + (i + 1) % numSegments);
		}

		verts.push(
			Math.cos(1 * Math.PI / 2), Math.sin(1 * Math.PI / 2), -0.5,
			Math.cos(1 * Math.PI / 2), Math.sin(1 * Math.PI / 2), 0.5,
			Math.cos(2 * Math.PI / 2), Math.sin(2 * Math.PI / 2), -0.5,
			Math.cos(2 * Math.PI / 2), Math.sin(2 * Math.PI / 2), 0.5,
			Math.cos(3 * Math.PI / 2), Math.sin(3 * Math.PI / 2), -0.5,
			Math.cos(3 * Math.PI / 2), Math.sin(3 * Math.PI / 2), 0.5,
			Math.cos(4 * Math.PI / 2), Math.sin(4 * Math.PI / 2), -0.5,
			Math.cos(4 * Math.PI / 2), Math.sin(4 * Math.PI / 2), 0.5
		);

		indices.push(
			2 * numSegments + 0, 2 * numSegments + 1,
			2 * numSegments + 2, 2 * numSegments + 3,
			2 * numSegments + 4, 2 * numSegments + 5,
			2 * numSegments + 6, 2 * numSegments + 7
		);

		this.getAttributeBuffer(MeshData.POSITION).set(verts);
		this.getIndexBuffer().set(indices);

		return this;
	};

	module.exports = PhysicsCylinderDebugShape;

/***/ },

/***/ 465:
/***/ function(module, exports, __webpack_require__) {

	var MeshData = __webpack_require__(14);

	/**
	 * A wireframe mesh indicating the position and orientation of a PlaneCollider.
	 * @extends MeshData
	 */
	function PhysicsPlaneDebugShape() {
		var attributeMap = MeshData.defaultMap([MeshData.POSITION]);
		MeshData.call(this, attributeMap, 10, 14);
		this.indexModes[0] = 'Lines';
		this.rebuild();
	}
	PhysicsPlaneDebugShape.prototype = Object.create(MeshData.prototype);
	PhysicsPlaneDebugShape.prototype.constructor = PhysicsPlaneDebugShape;

	/**
	 * @returns {PhysicsPlaneDebugShape}
	 */
	PhysicsPlaneDebugShape.prototype.buildWireframeData = function () {
		return new PhysicsPlaneDebugShape();
	};

	/**
	 * @returns {PhysicsPlaneDebugShape} self for chaining
	 */
	PhysicsPlaneDebugShape.prototype.rebuild = function () {
		var verts = [];
		var indices = [];

		verts.push(
			-1, -1, 0, // 0
			1, -1, 0, // 1
			1,  1, 0, // 2
			-1,  1, 0, // 3
			-2,  0, 0, // 4
			2,  0, 0, // 5
			0, -2, 0, // 6
			0,  2, 0, // 7
			0,  0, 0, // 8
			0,  0, 1  // 9
		);

		indices.push(
			0, 1,
			1, 2,
			2, 3,
			3, 0,
			4, 5,
			6, 7,
			8, 9
		);

		this.getAttributeBuffer(MeshData.POSITION).set(verts);

		this.getIndexBuffer().set(indices);

		return this;
	};

	module.exports = PhysicsPlaneDebugShape;

/***/ },

/***/ 466:
/***/ function(module, exports, __webpack_require__) {

	var MeshData = __webpack_require__(14);

	/**
	 * A wireframe mesh indicating the position and orientation of a SphereCollider.
	 * @param {number} [numSegments=32]
	 * @extends MeshData
	 */
	function PhysicsSphereDebugShape(numSegments) {
		numSegments = numSegments || 32;
		var attributeMap = MeshData.defaultMap([MeshData.POSITION]);
		this.numSegments = numSegments;
		MeshData.call(this, attributeMap, 3 * 3 * numSegments, 3 * 2 * numSegments);
		this.indexModes[0] = 'Lines';
		this.rebuild();
	}
	PhysicsSphereDebugShape.prototype = Object.create(MeshData.prototype);
	PhysicsSphereDebugShape.prototype.constructor = PhysicsSphereDebugShape;

	/**
	 * @returns {PhysicsSphereDebugShape}
	 */
	PhysicsSphereDebugShape.prototype.buildWireframeData = function () {
		return new PhysicsSphereDebugShape();
	};

	/**
	 * @returns {PhysicsSphereDebugShape} self for chaining
	 */
	PhysicsSphereDebugShape.prototype.rebuild = function () {
		var verts = [];
		var indices = [];
		var numSegments = this.numSegments;

		// Around x
		for (var i = 0; i < numSegments; i++) {
			verts.push(0, Math.cos(2 * Math.PI * i / numSegments), Math.sin(2 * Math.PI * i / numSegments));
			indices.push(i, (i + 1) % numSegments);
		}

		// Around y
		for (var i = 0; i < numSegments; i++) {
			verts.push(Math.cos(2 * Math.PI * i / numSegments), 0, Math.sin(2 * Math.PI * i / numSegments));
			indices.push(numSegments + i, numSegments + (i + 1) % numSegments);
		}

		// Around z
		for (var i = 0; i < numSegments; i++) {
			verts.push(Math.cos(2 * Math.PI * i / numSegments), Math.sin(2 * Math.PI * i / numSegments), 0);
			indices.push(2 * numSegments + i, 2 * numSegments + (i + 1) % numSegments);
		}

		this.getAttributeBuffer(MeshData.POSITION).set(verts);
		this.getIndexBuffer().set(indices);

		return this;
	};

	module.exports = PhysicsSphereDebugShape;

/***/ },

/***/ 467:
/***/ function(module, exports, __webpack_require__) {

	var System = __webpack_require__(42);
	var SystemBus = __webpack_require__(44);

	/**
	 * Base class for physics systems.
	 * @extends System
	 */
	function AbstractPhysicsSystem() {
		System.apply(this, arguments);

		this.priority = -1;

		/**
		 * Entitites that holds ColliderComponents, but aren't instantiated since they have no RigidBodyComponent
		 */
		this._activeColliderEntities = [];

		this._colliderInsertedListener = function (event) {
			this._activeColliderEntities.push(event.entity);
			this._colliderInserted(event.entity);
		}.bind(this);

		this._colliderDeletedListener = function (event) {
			var entities = this._activeColliderEntities;
			var index = entities.indexOf(event.entity);
			if (index !== -1) {
				this._activeColliderEntities.splice(index, 1);
			}
			this._colliderDeleted(event.entity);
		}.bind(this);

		this._colliderDeletedComponentListener = function (event) {
			this._colliderDeletedComponent(event.entity, event.component);
		}.bind(this);

		SystemBus.addListener('goo.collider.inserted', this._colliderInsertedListener);
		SystemBus.addListener('goo.collider.deleted', this._colliderDeletedListener);
		SystemBus.addListener('goo.collider.deletedComponent', this._colliderDeletedComponentListener);
	}
	AbstractPhysicsSystem.prototype = Object.create(System.prototype);
	AbstractPhysicsSystem.prototype.constructor = AbstractPhysicsSystem;

	/**
	 * @virtual
	 * @param {Vector3} gravityVector
	 */
	AbstractPhysicsSystem.prototype.setGravity = function (/*gravityVector*/) {};

	var event = {
		entityA: null,
		entityB: null
	};

	/**
	 * @private
	 */
	AbstractPhysicsSystem.prototype.emitSubStepEvent = function () {
		SystemBus.emit('goo.physics.substep');
	};

	/**
	 * @private
	 * @param  {Entity} entityA
	 * @param  {Entity} entityB
	 */
	AbstractPhysicsSystem.prototype.emitBeginContact = function (entityA, entityB) {
		this._emitEvent('goo.physics.beginContact', entityA, entityB);
	};

	/**
	 * @private
	 * @param  {Entity} entityA
	 * @param  {Entity} entityB
	 */
	AbstractPhysicsSystem.prototype.emitDuringContact = function (entityA, entityB) {
		this._emitEvent('goo.physics.duringContact', entityA, entityB);
	};

	/**
	 * @private
	 * @param  {Entity} entityA
	 * @param  {Entity} entityB
	 */
	AbstractPhysicsSystem.prototype.emitEndContact = function (entityA, entityB) {
		this._emitEvent('goo.physics.endContact', entityA, entityB);
	};

	/**
	 * @private
	 * @param  {Entity} triggerEntity
	 * @param  {Entity} otherEntity
	 */
	AbstractPhysicsSystem.prototype.emitTriggerEnter = function (triggerEntity, otherEntity) {
		this._emitEvent('goo.physics.triggerEnter', triggerEntity, otherEntity);
	};

	/**
	 * @private
	 * @param  {Entity} triggerEntity
	 * @param  {Entity} otherEntity
	 */
	AbstractPhysicsSystem.prototype.emitTriggerStay = function (triggerEntity, otherEntity) {
		this._emitEvent('goo.physics.triggerStay', triggerEntity, otherEntity);
	};

	/**
	 * @private
	 * @param  {Entity} triggerEntity
	 * @param  {Entity} otherEntity
	 */
	AbstractPhysicsSystem.prototype.emitTriggerExit = function (triggerEntity, otherEntity) {
		this._emitEvent('goo.physics.triggerExit', triggerEntity, otherEntity);
	};

	AbstractPhysicsSystem.prototype._emitEvent = function (channel, entityA, entityB) {
		event.entityA = entityA;
		event.entityB = entityB;
		SystemBus.emit(channel, event);
		event.entityA = null;
		event.entityB = null;
	};

	AbstractPhysicsSystem.prototype._colliderInserted = function (/*entity*/) {};
	AbstractPhysicsSystem.prototype._colliderDeleted = function (/*entity*/) {};
	AbstractPhysicsSystem.prototype._colliderDeletedComponent = function (/*entity*/) {};

	module.exports = AbstractPhysicsSystem;

/***/ },

/***/ 468:
/***/ function(module, exports, __webpack_require__) {

	var System = __webpack_require__(42);
	var SystemBus = __webpack_require__(44);

	/**
	 * Processes all entities with collider components, making sure they are up to date.
	 * @extends System
	 */
	function ColliderSystem() {
		System.call(this, 'ColliderSystem', ['ColliderComponent', 'TransformComponent']);
		this.priority = 1; // Should be processed after TransformSystem
	}
	ColliderSystem.prototype = Object.create(System.prototype);
	ColliderSystem.prototype.constructor = ColliderSystem;

	/**
	 * @private
	 * @param {array} entities
	 */
	ColliderSystem.prototype.process = function (/*entities*/) {
	};

	/**
	 * @private
	 * @param  {Entity} entity
	 */
	ColliderSystem.prototype.inserted = function (entity) {
		SystemBus.emit('goo.collider.inserted', {
			entity: entity
		});
	};

	/**
	 * @private
	 * @param  {Entity} entity
	 */
	ColliderSystem.prototype.deleted = function (entity) {
		SystemBus.emit('goo.collider.deleted', {
			entity: entity
		});
	};

	/**
	 * @private
	 * @param  {Entity} entity
	 * @param  {Component} component
	 */
	ColliderSystem.prototype.removedComponent = function (entity, component) {
		SystemBus.emit('goo.collider.deletedComponent', {
			entity: entity,
			component: component
		});
	};

	module.exports = ColliderSystem;

/***/ },

/***/ 469:
/***/ function(module, exports, __webpack_require__) {

	var EntitySelection = __webpack_require__(21);
	var System = __webpack_require__(42);
	var SystemBus = __webpack_require__(44);
	var PhysicsPlaneDebugShape = __webpack_require__(465);
	var PhysicsCylinderDebugShape = __webpack_require__(464);
	var PhysicsSphereDebugShape = __webpack_require__(466);
	var PhysicsBoxDebugShape = __webpack_require__(463);
	var SphereCollider = __webpack_require__(451);
	var BoxCollider = __webpack_require__(446);
	var CylinderCollider = __webpack_require__(448);
	var PlaneCollider = __webpack_require__(450);
	var MeshCollider = __webpack_require__(449);
	var Transform = __webpack_require__(41);
	var Material = __webpack_require__(30);
	var ShaderLib = __webpack_require__(46);
	var Pool = __webpack_require__(470);

	/**
	 * Renders all ColliderComponents in the scene.
	 * @extends System
	 * @example
	 * world.setSystem(new PhysicsDebugRenderSystem());
	 */
	function PhysicsDebugRenderSystem() {
		System.call(this, 'PhysicsDebugRenderSystem', ['TransformComponent']);

		this.priority = 3;

		this.renderList = [];
		this.camera = null;

		SystemBus.addListener('goo.setCurrentCamera', function (newCam) {
			this.camera = newCam.camera;
		}.bind(this));

		/**
		 * If set to true, all entities with a ColliderComponent attached is rendered, and the selection is disregarded.
		 * @type {boolean}
		 */
		this.renderAll = true;

		/**
		 * The selected entities to be rendered.
		 * @type {EntitySelection}
		 */
		this.selection = new EntitySelection();

		this.sphereMeshData = new PhysicsSphereDebugShape(32);
		this.boxMeshData = new PhysicsBoxDebugShape();
		this.cylinderMeshData = new PhysicsCylinderDebugShape(32);
		this.planeMeshData = new PhysicsPlaneDebugShape();

		this.material = new Material(ShaderLib.simpleColored);
		this.material.uniforms.color = [0, 1, 0];
		this.material.wireframe = true;
		this.renderablePool = new Pool({
			create: function () {
				return {
					meshData: null,
					transform: new Transform(),
					materials: []
				};
			},
			init: function (meshData, material) {
				this.meshData = meshData;
				this.materials[0] = material;
			},
			destroy: function (renderable) {
				renderable.meshData = null;
				renderable.materials.length = 0;
			}
		});
	}
	PhysicsDebugRenderSystem.prototype = Object.create(System.prototype);
	PhysicsDebugRenderSystem.prototype.constructor = PhysicsDebugRenderSystem;

	/**
	 * @private
	 * @param  {array} entities
	 */
	PhysicsDebugRenderSystem.prototype.process = function (entities) {
		this.clear();

		if (this.passive) {
			return;
		}

		for (var i = 0, N = entities.length; i !== N; i++) {
			var entity = entities[i];

			if (!this.renderAll && !this.selection.contains(entity)) {
				// Render selection is enabled, but this entity is not a part of it
				continue;
			}

			// Colliders
			if (entity.colliderComponent) {
				entity.colliderComponent.updateWorldCollider();
				var collider = entity.colliderComponent.worldCollider;
				var meshData = this.getMeshData(collider);
				var renderable = this.renderablePool.get(meshData, this.material);

				this.getWorldTransform(entity, collider, renderable.transform);
				renderable.transform.update();

				this.renderList.push(renderable);
			}

			// TODO: Joints
		}
	};

	/**
	 * Get the world transform of the debug rendering mesh data from a collider.
	 * @private
	 * @param  {Entity} colliderEntity
	 * @param  {Collider} collider
	 * @param  {Transform} targetTransform
	 */
	PhysicsDebugRenderSystem.prototype.getWorldTransform = function (colliderEntity, collider, targetTransform) {
		targetTransform.copy(colliderEntity.transformComponent.sync().worldTransform);

		if (collider instanceof SphereCollider) {
			var scale = collider.radius;
			targetTransform.scale.set(scale, scale, scale);
		} else if (collider instanceof BoxCollider) {
			targetTransform.scale.copy(collider.halfExtents).scale(2);
		} else if (collider instanceof CylinderCollider) {
			targetTransform.scale.set(collider.radius, collider.radius, collider.height);
		} else if (collider instanceof PlaneCollider) {
			targetTransform.scale.set(1, 1, 1);
		} else if (collider instanceof MeshCollider) {
			targetTransform.scale.set(collider.scale);
		}
	};

	/**
	 * Get mesh data to use for debug rendering.
	 * @private
	 * @param  {Collider} collider
	 * @returns {MeshData}
	 */
	PhysicsDebugRenderSystem.prototype.getMeshData = function (collider) {
		var meshData;
		if (collider instanceof SphereCollider) {
			meshData = this.sphereMeshData;
		} else if (collider instanceof BoxCollider) {
			meshData = this.boxMeshData;
		} else if (collider instanceof CylinderCollider) {
			meshData = this.cylinderMeshData;
		} else if (collider instanceof PlaneCollider) {
			meshData = this.planeMeshData;
		} else if (collider instanceof MeshCollider) {
			meshData = collider.meshData;
		}
		return meshData;
	};

	/**
	 * @private
	 * @param  {Renderer} renderer
	 */
	PhysicsDebugRenderSystem.prototype.render = function (renderer) {
		renderer.checkResize(this.camera);
		if (this.camera) {
			renderer.render(this.renderList, this.camera, null, null, false);
		}
	};

	/**
	 * Release all previous renderables in the renderList
	 * @private
	 */
	PhysicsDebugRenderSystem.prototype.clear = function () {
		for (var i = 0, N = this.renderList.length; i !== N; i++) {
			this.renderablePool.release(this.renderList[i]);
		}
		this.renderList.length = 0;
	};

	/**
	 * @private
	 */
	PhysicsDebugRenderSystem.prototype.cleanup = function () {
		this.clear();
	};

	module.exports = PhysicsDebugRenderSystem;

/***/ },

/***/ 470:
/***/ function(module, exports) {

	/**
	 * Abstract pool class for object pooling.
	 * @param {Object} [settings]
	 * @param {Function} [settings.init]
	 * @param {Function} [settings.create]
	 * @param {Function} [settings.destroy]
	 * @example
	 * var vectorPool = new Pool({
	 *     create: function () {
	 *         return new Vector3();
	 *     },
	 *     init: function (x, y, z) {
	 *         this.set(x, y, z);
	 *     },
	 *     destroy: function (vector) {
	 *         vector.set(0, 0, 0);
	 *     }
	 * });
	 * var vector = vectorPool.get(1, 2, 3);
	 * vectorPool.release(vector);
	 */
	function Pool(settings) {
		settings = settings || {};

		/**
		 * @private
		 * @type {Array}
		 */
		this._objects = [];

		/**
		 * @private
		 * @type {Function}
		 */
		this._init = settings.init || function () {};

		/**
		 * @private
		 * @type {Function}
		 */
		this._create = settings.create || function () {};

		/**
		 * @private
		 * @type {Function}
		 */
		this._destroy = settings.destroy || function () {};
	}

	/**
	 * Fill the pool so it has exactly "size" objects. If the current number of objects is larger than the requested size, the excess objects are destroyed.
	 * @param {number} size
	 */
	Pool.prototype.resize = function (size) {
		var objects = this._objects;

		// Destroy excess objects
		while (objects.length > size) {
			this._destroy(objects.pop());
		}

		// Allocate new objects
		while (objects.length < size) {
			objects.push(this._create());
		}

		return this;
	};

	/**
	 * Get an object from the pool if there are free ones, or create a new object.
	 * @returns {Object}
	 */
	Pool.prototype.get = function () {
		var objects = this._objects;
		var object = objects.length ? objects.pop() : this._create();
		this._init.apply(object, arguments);
		return object;
	};

	/**
	 * Put an object back into the pool.
	 * @param {Object} object
	 */
	Pool.prototype.release = function (object) {
		this._destroy(object);
		this._objects.push(object);
		return this;
	};

	module.exports = Pool;

/***/ },

/***/ 471:
/***/ function(module, exports, __webpack_require__) {

	var AbstractPhysicsSystem = __webpack_require__(467);
	var RaycastResult = __webpack_require__(462);
	var RigidBodyComponent = __webpack_require__(455);
	var Vector3 = __webpack_require__(8);
	var Quaternion = __webpack_require__(23);
	var Transform = __webpack_require__(41);

	/* global CANNON */

	var tmpVec1;
	var tmpVec2;
	var tmpQuat = new Quaternion();
	var tmpVec = new Vector3();
	var tmpCannonResult;
	var tmpTransform = new Transform();

	/**
	 * A physics system using [Cannon.js]{@link http://github.com/schteppe/cannon.js}.
	 * @extends AbstractPhysicsSystem
	 * @param {Object} [settings]
	 * @param {Vector3} [settings.gravity]
	 */
	function PhysicsSystem(settings) {
		settings = settings || {};

		/**
		 * @type {CANNON.World}
		 */
		this.cannonWorld = new CANNON.World({
			broadphase: new CANNON.SAPBroadphase()
		});

		this.cannonWorld.addEventListener('beginShapeContact', function (evt) {
			var shapeIdToColliderEntityMap = this._shapeIdToColliderEntityMap;
			var entityA = shapeIdToColliderEntityMap.get(evt.shapeA.id);
			var entityB = shapeIdToColliderEntityMap.get(evt.shapeB.id);

			if (!entityA || !entityB) {
				return;
			}

			var colliderComponentA = entityA.colliderComponent;
			var colliderComponentB = entityB.colliderComponent;
			if (colliderComponentA.isTrigger || colliderComponentB.isTrigger) {
				this.emitTriggerEnter(entityA, entityB);
				this._stayingEntities.push(entityA, entityB);

				// At least one of the colliders need to have a non-kinematic rigid body
			} else if ((colliderComponentA.getBodyEntity() && !colliderComponentA.getBodyEntity().rigidBodyComponent.isKinematic) || (colliderComponentB.getBodyEntity() && !colliderComponentB.getBodyEntity().rigidBodyComponent.isKinematic)) {
				this.emitBeginContact(entityA, entityB);
				this._stayingEntities.push(entityA, entityB);
			}
		}.bind(this));

		this.cannonWorld.addEventListener('endShapeContact', function (evt) {
			var shapeIdToColliderEntityMap = this._shapeIdToColliderEntityMap;
			var entityA = shapeIdToColliderEntityMap.get(evt.shapeA.id);
			var entityB = shapeIdToColliderEntityMap.get(evt.shapeB.id);

			// Remove them from the staying array
			var stayingEntities = this._stayingEntities;
			for (var i = 0; i < stayingEntities.length; i += 2) {
				if ((stayingEntities[i] === entityA && stayingEntities[i + 1] === entityB) || (stayingEntities[i] === entityB && stayingEntities[i + 1] === entityA)) {
					stayingEntities.splice(i, 2);
					break;
				}
			}

			if ((entityA.colliderComponent && entityA.colliderComponent.isTrigger) || (entityB.colliderComponent && entityB.colliderComponent.isTrigger)) {
				this.emitTriggerExit(entityA, entityB);
			} else {
				this.emitEndContact(entityA, entityB);
			}
		}.bind(this));

		this.cannonWorld.addEventListener('postStep', function () {
			this.emitSubStepEvent();
			var stayingEntities = this._stayingEntities;
			for (var i = 0; i < stayingEntities.length; i += 2) {
				var entityA = stayingEntities[i];
				var entityB = stayingEntities[i + 1];
				if ((entityA.colliderComponent && entityA.colliderComponent.isTrigger) || (entityB.colliderComponent && entityB.colliderComponent.isTrigger)) {
					this.emitTriggerStay(entityA, entityB);
				} else {
					this.emitDuringContact(entityA, entityB);
				}
			}
		}.bind(this));

		this._stayingEntities = [];
		this._entities = {};
		this._shapeIdToColliderEntityMap = new Map();

		if (!tmpVec1) {
			tmpVec1 = new CANNON.Vec3();
			tmpVec2 = new CANNON.Vec3();
			tmpCannonResult = new CANNON.RaycastResult();
		}

		this.setGravity(settings.gravity || new Vector3(0, -10, 0));

		this.initialized = false;

		AbstractPhysicsSystem.call(this, 'PhysicsSystem', ['RigidBodyComponent']);
	}

	PhysicsSystem.prototype = Object.create(AbstractPhysicsSystem.prototype);
	PhysicsSystem.prototype.constructor = PhysicsSystem;

	/**
	 * @param {Vector3} gravityVector
	 */
	PhysicsSystem.prototype.setGravity = function (gravityVector) {
		this.cannonWorld.gravity.copy(gravityVector);
	};

	/**
	 * @param {Vector3} store
	 */
	PhysicsSystem.prototype.getGravity = function (store) {
		var gravity = this.cannonWorld.gravity;
		store.x = gravity.x;
		store.y = gravity.y;
		store.z = gravity.z;
	};

	/**
	 * @private
	 * @param {number} fixedDeltaTime
	 */
	PhysicsSystem.prototype.step = function (fixedDeltaTime) {
		var world = this.cannonWorld;

		// Step the world forward in time
		world.step(fixedDeltaTime);
	};

	var tmpOptions = {};
	PhysicsSystem.prototype._getCannonRaycastOptions = function (options) {
		tmpOptions.collisionFilterMask = options.collisionMask !== undefined ? options.collisionMask : -1;
		tmpOptions.collisionFilterGroup = options.collisionGroup !== undefined ? options.collisionGroup : -1;
		tmpOptions.skipBackfaces = options.skipBackfaces !== undefined ? options.skipBackfaces : true;
		return tmpOptions;
	};

	PhysicsSystem.prototype._copyCannonRaycastResultToGoo = function (cannonResult, gooResult, rayStart) {
		if (cannonResult.hasHit) {
			gooResult.entity = this._shapeIdToColliderEntityMap.get(cannonResult.shape.id);
			var point = cannonResult.hitPointWorld;
			var normal = cannonResult.hitNormalWorld;
			gooResult.point.setDirect(point.x, point.y, point.z);
			gooResult.normal.setDirect(normal.x, normal.y, normal.z);
			gooResult.distance = rayStart.distance(gooResult.point);
		}
		return cannonResult.hasHit;
	};

	// Get the start & end of the ray, store in cannon vectors
	PhysicsSystem.prototype._getCannonStartEnd = function (start, direction, distance, cannonStart, cannonEnd) {
		cannonStart.copy(start);
		cannonEnd.copy(direction);
		cannonEnd.scale(distance, cannonEnd);
		cannonEnd.vadd(start, cannonEnd);
	};

	/**
	 * Make a ray cast into the world of colliders, stopping at the first hit that the ray intersects. Note that there's no given order in the traversal, and there's no control over what will be returned.
	 * @param  {Vector3} start
	 * @param  {Vector3} direction
	 * @param  {number} maxDistance
	 * @param  {Object} [options]
	 * @param  {number} [options.collisionMask=-1]
	 * @param  {number} [options.collisionGroup=-1]
	 * @param  {number} [options.skipBackFaces=true]
	 * @param  {RaycastResult} [result]
	 * @returns {boolean} True if hit, else false
	 */
	PhysicsSystem.prototype.raycastAny = function (start, direction, maxDistance, options, result) {
		if (options instanceof RaycastResult) {
			result = options;
			options = {};
		}
		options = options || {};
		result = result || new RaycastResult();

		var cannonStart = tmpVec1;
		var cannonEnd = tmpVec2;
		this._getCannonStartEnd(start, direction, maxDistance, cannonStart, cannonEnd);

		this.cannonWorld.raycastAny(cannonStart, cannonEnd, this._getCannonRaycastOptions(options), tmpCannonResult);

		return this._copyCannonRaycastResultToGoo(tmpCannonResult, result, start);
	};

	/**
	 * Make a ray cast into the world of colliders, and only return the closest hit.
	 * @param  {Vector3} start
	 * @param  {Vector3} direction
	 * @param  {number} maxDistance
	 * @param  {Object} [options]
	 * @param  {number} [options.collisionMask=-1]
	 * @param  {number} [options.collisionGroup=-1]
	 * @param  {number} [options.skipBackFaces=true]
	 * @param  {RaycastResult} [result]
	 * @returns {boolean} True if hit, else false
	 */
	PhysicsSystem.prototype.raycastClosest = function (start, direction, maxDistance, options, result) {
		if (options instanceof RaycastResult) {
			result = options;
			options = {};
		}
		options = options || {};
		result = result || new RaycastResult();

		var cannonStart = tmpVec1;
		var cannonEnd = tmpVec2;
		this._getCannonStartEnd(start, direction, maxDistance, cannonStart, cannonEnd);

		this.cannonWorld.raycastClosest(cannonStart, cannonEnd, this._getCannonRaycastOptions(options), tmpCannonResult);

		return this._copyCannonRaycastResultToGoo(tmpCannonResult, result, start);
	};

	var tmpResult = new RaycastResult();

	/**
	 * Make a ray cast into the world of colliders, evaluating the given callback once at every hit.
	 * @param  {Vector3} start
	 * @param  {Vector3} direction
	 * @param  {number} maxDistance
	 * @param  {Object} [options]
	 * @param  {number} [options.collisionMask=-1]
	 * @param  {number} [options.collisionGroup=-1]
	 * @param  {number} [options.skipBackFaces=true]
	 * @param  {function (result: RaycastResult) : boolean} callback
	 * @returns {boolean} True if hit, else false
	 */
	PhysicsSystem.prototype.raycastAll = function (start, direction, maxDistance, options, callback) {
		if (typeof options === 'function') {
			callback = options;
			options = {};
		}
		callback = callback || function () {};

		var cannonStart = tmpVec1;
		var cannonEnd = tmpVec2;
		this._getCannonStartEnd(start, direction, maxDistance, cannonStart, cannonEnd);

		var that = this;
		var hitAny = false;
		this.cannonWorld.raycastAll(cannonStart, cannonEnd, this._getCannonRaycastOptions(options), function (cannonResult) {
			var hit = that._copyCannonRaycastResultToGoo(cannonResult, tmpResult, start);
			if (hit) {
				hitAny = true;
			}
			if (callback(tmpResult) === false) {
				cannonResult.abort();
			}
		});

		return hitAny;
	};

	/**
	 * Resumes simulation and starts updating the entities after stop() or pause().
	 */
	PhysicsSystem.prototype.play = function () {
		this.passive = false;

		// Initialize all of the physics world
		this.initialize();
	};

	/**
	 * Stops simulation and updating of the entitiy transforms.
	 */
	PhysicsSystem.prototype.pause = function () {
		this.passive = true;
	};

	/**
	 * Resumes simulation and starts updating the entities after stop() or pause(); an alias for `.play`
	 */
	PhysicsSystem.prototype.resume = function () {
		this.passive = false;
	};

	/**
	 * Stops simulation.
	 */
	PhysicsSystem.prototype.stop = function () {
		this.pause();

		// Trash the physics world
		this.destroy();
	};

	/**
	 * @private
	 * @param  {array} entities
	 */
	PhysicsSystem.prototype.initialize = function (entities) {
		entities = entities || this._activeEntities;

		var N = entities.length;

		for (var i = 0; i !== N; i++) {
			var entity = entities[i];
			var rigidBodyComponent = entity.rigidBodyComponent;

			// Initialize body
			rigidBodyComponent.initialize();
		}

		// Initialize all lonely colliders without rigid body
		var colliderEntities = this._activeColliderEntities;
		for (var i = 0; i !== colliderEntities.length; i++) {
			var colliderEntity = colliderEntities[i];

			if (!colliderEntity.colliderComponent) { // Needed?
				continue;
			}

			if (!colliderEntity.colliderComponent.getBodyEntity() && !colliderEntity.colliderComponent.cannonBody) {
				colliderEntity.colliderComponent.initialize();
			}
		}

		// Initialize joints - must be done *after* all bodies were initialized
		for (var i = 0; i !== N; i++) {
			var entity = entities[i];

			var joints = entity.rigidBodyComponent.joints;
			for (var j = 0; j < joints.length; j++) {
				var joint = joints[j];
				entity.rigidBodyComponent.initializeJoint(joint, entity, this);
			}
		}

		this.initialized = true;
	};

	/**
	 * @private
	 * @param  {array} entities
	 */
	PhysicsSystem.prototype.destroy = function (entities) {
		entities = entities || this._activeEntities;
		var N = entities.length;

		this._shapeIdToColliderEntityMap.forEach(function (key) {
			this._shapeIdToColliderEntityMap.delete(key);
		}.bind(this));

		// Empty the contact event lists
		this._stayingEntities.length = 0;

		// Destroy joints
		for (var i = 0; i !== N; i++) {
			var entity = entities[i];

			var joints = entity.rigidBodyComponent.joints;
			for (var j = 0; j < joints.length; j++) {
				var joint = joints[j];
				entity.rigidBodyComponent.destroyJoint(joint, entity, this);
			}
		}

		// Destroy all lonely colliders without rigid body
		for (var i = 0; i !== this._activeColliderEntities.length; i++) {
			var colliderEntity = this._activeColliderEntities[i];

			if (!colliderEntity.colliderComponent) { // Needed?
				continue;
			}

			if (colliderEntity.colliderComponent.cannonBody) {
				colliderEntity.colliderComponent.destroy();
			}
		}

		for (var i = 0; i !== N; i++) {
			var entity = entities[i];
			var rigidBodyComponent = entity.rigidBodyComponent;

			// Destroy body
			rigidBodyComponent.destroy();
		}

		this.initialized = false;
	};

	/**
	 * @private
	 * @param  {array} entities
	 * @param  {number} tpf
	 */
	PhysicsSystem.prototype.fixedUpdate = function (entities, fixedTpf) {
		if (!this.initialized) {
			this.initialize();
		}
		if (entities.length === 0) {
			return;
		}
		this.step(fixedTpf);
	};

	PhysicsSystem.prototype.process = function (entities) {
		if (!this.initialized) {
			this.initialize();
		}
		if (entities.length === 0) {
			return;
		}
		this.syncTransforms(entities);
	};

	/**
	 * @private
	 * @param  {array} entities
	 */
	PhysicsSystem.prototype.syncTransforms = function (entities) {
		var N = entities.length;

		// Need a tree traversal, that takes the roots first
		var queue = [];
		for (var i = 0; i !== N; i++) {
			var entity = entities[i];
			var rigidBodyComponent = entity.rigidBodyComponent;

			// Set updated = false so we don't update the same twice
			rigidBodyComponent._updated = false;

			if (!entity.transformComponent.parent) {
				// Add roots at the end of the array
				queue.push(entity);
			} else {
				// Children first
				queue.unshift(entity);
			}
		}

		// Update positions of entities from the physics data
		while (queue.length) {
			var entity = queue.pop();
			var rigidBodyComponent = entity.rigidBodyComponent;
			var transformComponent = entity.transformComponent;
			var transform = transformComponent.transform;

			if (rigidBodyComponent._updated) {
				continue;
			}
			rigidBodyComponent._updated = true;

			// Get physics orientation
			if (rigidBodyComponent.interpolation === RigidBodyComponent.INTERPOLATE) {
				rigidBodyComponent.getInterpolatedPosition(tmpVec);
				rigidBodyComponent.getInterpolatedQuaternion(tmpQuat);
			} else {
				rigidBodyComponent.getPosition(tmpVec);
				rigidBodyComponent.getQuaternion(tmpQuat);
			}

			// Set local transform of the entity
			transform.translation.set(tmpVec);
			transform.rotation.copyQuaternion(tmpQuat);

			var parent = transformComponent.parent;
			if (parent) {
				// The rigid body is a child, but we have its physics world transform
				// and need to set the world transform of it.
				parent.entity.transformComponent.sync().worldTransform.invert(tmpTransform);
				Transform.combine(tmpTransform, transform, tmpTransform);

				transform.rotation.copy(tmpTransform.rotation);
				transform.translation.copy(tmpTransform.translation);
			}

			transformComponent.setUpdated();
		}
	};

	module.exports = PhysicsSystem;

/***/ }

});
