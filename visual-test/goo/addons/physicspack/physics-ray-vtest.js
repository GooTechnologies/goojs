require([
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/renderer/RenderQueue',
	'goo/renderer/light/DirectionalLight',
	'goo/shapes/Box',
	'goo/shapes/Cylinder',
	'goo/shapes/Sphere',
	'goo/math/Vector3',
	'goo/math/Quaternion',
	'goo/renderer/MeshData',
	'goo/addons/linerenderpack/LineRenderSystem',
	'goo/addons/physicspack/components/ColliderComponent',
	'goo/addons/physicspack/systems/PhysicsSystem',
	'goo/addons/physicspack/RaycastResult',
	'goo/addons/physicspack/systems/ColliderSystem',
	'goo/addons/physicspack/components/RigidbodyComponent',
	'goo/addons/physicspack/colliders/BoxCollider',
	'goo/addons/physicspack/colliders/CylinderCollider',
	'goo/addons/physicspack/colliders/SphereCollider',
	'goo/addons/physicspack/colliders/PlaneCollider',
	'goo/addons/physicspack/colliders/MeshCollider',
	'lib/V'
], function (Material,
			 ShaderLib,
			 RenderQueue,
			 DirectionalLight,
			 Box,
			 Cylinder,
			 Sphere,
			 Vector3,
			 Quaternion,
			 MeshData,
			 LineRenderSystem,
			 ColliderComponent,
			 PhysicsSystem,
			 RaycastResult,
			 ColliderSystem,
			 RigidbodyComponent,
			 BoxCollider,
			 CylinderCollider,
			 SphereCollider,
			 PlaneCollider,
			 MeshCollider,
			 V) {
	'use strict';

	V.describe(
		'<b>Red Line</b>: raycastAll<br>' +
		'<b>Green Line</b>: raycastAny<br>' +
		'<b>White Line</b>: raycastClosest<br>' +
		'<b>Magenta Line</b>: raycastAll - with backfaces<br>' +
		'<b>Yellow Shapes</b>: mesh colliders<br>' +
		'<b>Blue Shapes</b>: primitive colliders<br>');

	var goo = V.initGoo();
	var world = goo.world;
	var lineRenderSystem = new LineRenderSystem(world);
	var physicsSystem = new PhysicsSystem();

	goo.setRenderSystem(lineRenderSystem);

	world.setSystem(physicsSystem);
	world.setSystem(new ColliderSystem());

	V.addOrbitCamera(new Vector3(9, Math.PI / 1.2, 0.7), new Vector3(1.5, 0, 1.5));

	var addDirectionalLight = function (directionArr) {
		var directionalLight = new DirectionalLight();
		directionalLight.intensity = 0.5;
		directionalLight.specularIntensity = 1;
		var directionalLightEntity = world.createEntity(directionalLight, directionArr).addToWorld();
		directionalLightEntity.transformComponent.transform.lookAt(new Vector3(0, 0, 0), Vector3.UNIT_Y);
	};

	addDirectionalLight([1, 1, -1]);
	addDirectionalLight([-1, -1, -1]);

	var createMaterial = function (materialName, color) {
		var material = new Material(materialName, ShaderLib.uber);
		material.uniforms.materialAmbient = [color[0], color[1], color[2], color[3]];
		material.uniforms.opacity = 0.6;
		material.blendState.blending = 'CustomBlending';
		material.renderQueue = RenderQueue.TRANSPARENT;
		material.depthState.write = false;

		return material;
	};

	/**
	 * An entity for ray-casting against.
	 * @param {World} world The world in which lines are rendered in.
	 * @param {Vector3} position
	 * @param {number} shapeType The shape-type, for instance: ColliderEntity.SPHERE, ColliderEntity.BOX or ColliderEntity.CYLINDER.
	 * @param {boolean} isPrimitive Determines if this ColliderEntity is a primitive-collider or a mesh-collider.
	 * @constructor
	 */
	var ColliderEntity = function (world, position, shapeType, isPrimitive) {

		this.world = world;
		this.shapeType = shapeType;
		this.isPrimitive = isPrimitive;

		this.shape = null;
		this.shapeCollider = null;
		this.material = null;
		this.rigidBodyComponent = null;
		this.colliderComponent = null;
		this.entity = null;

		this.initialize(position);
	};

	ColliderEntity.SPHERE = 0;
	ColliderEntity.BOX = 1;
	ColliderEntity.CYLINDER = 2;

	ColliderEntity.MESH_COLLIDER_MATERIAL = createMaterial('MeshColliderMaterial', [0.5, 0.5, 0, 1]);
	ColliderEntity.PRIMITIVE_COLLIDER_MATERIAL = createMaterial('PrimitiveColliderMaterial', [0.0, 0.5, 0.5, 1]);

	/**
	 * Populates the ColliderEntity's properties.
	 * @param {Vector3} position
	 */
	ColliderEntity.prototype.initialize = function (position) {
		switch (this.shapeType) {
			case ColliderEntity.SPHERE:
				this.shape = new Sphere(8, 8, 0.5);
				this.shapeCollider = new SphereCollider({radius: this.shape.radius});
				break;
			case ColliderEntity.BOX:
				this.shape = new Box(0.5, 0.5);
				this.shapeCollider = new BoxCollider({halfExtents: new Vector3(this.shape.xExtent, this.shape.yExtent, this.shape.zExtent)});
				break;
			case ColliderEntity.CYLINDER:
				this.shape = new Cylinder(8, 0.25, 0.25, 0.5);
				this.shapeCollider = new CylinderCollider({radius: this.shape.radiusTop, height: this.shape.height});
				break;
		}

		if (this.isPrimitive) {
			this.material = ColliderEntity.PRIMITIVE_COLLIDER_MATERIAL;
		}
		else {
			this.material = ColliderEntity.MESH_COLLIDER_MATERIAL;
			this.shapeCollider = new MeshCollider({meshData: this.shape});
		}

		this.rigidBodyComponent = new RigidbodyComponent({mass: 0});
		this.colliderComponent = new ColliderComponent({collider: this.shapeCollider});

		this.entity = this.world.createEntity(this.shape, this.material, position, this.rigidBodyComponent, this.colliderComponent).addToWorld();
	};

	var normalEndPosition = new Vector3();
	var drawNormal = function (position, normal) {
		normalEndPosition.setVector(normal).scale(0.5).addVector(position);

		lineRenderSystem.drawLine(position, normalEndPosition, lineRenderSystem.BLUE);
	};

	var arrowStartPosition = new Vector3();
	var arrowEndPosition = new Vector3();
	var arrowDirection = new Vector3();
	var drawLineArrow = function (origin, direction, length, fraction, color, width) {

		arrowStartPosition.setVector(direction).scale(length * fraction).addVector(origin);
		arrowEndPosition.setVector(direction).scale(-width).addVector(arrowStartPosition);

		var arrowUpDirection = arrowDirection.setVector(Vector3.UNIT_Y).scale(width);
		arrowUpDirection.addVector(arrowEndPosition);

		lineRenderSystem.drawLine(arrowStartPosition, arrowUpDirection, color);

		var arrowDownDirection = arrowDirection.subVector(arrowEndPosition);
		arrowDownDirection.scale(-1);
		arrowDownDirection.addVector(arrowEndPosition);

		lineRenderSystem.drawLine(arrowStartPosition, arrowDownDirection, color);
	};

	var lineEndVector = new Vector3();
	var drawArrowedLine = function (origin, direction, length, time, color) {

		var lengthRound = Math.round(length);

		var lengthFraction = 1 / lengthRound;

		var arrowOffset = (time * lengthFraction) % lengthFraction;
		for (var i = 0; i < lengthRound; i++) {
			var frac = i * lengthFraction + arrowOffset;
			drawLineArrow(origin, direction, length, frac, color, 0.05);
		}

		lineEndVector.setVector(direction).scale(length).addVector(origin);
		lineRenderSystem.drawLine(origin, lineEndVector, color);
	};


	var tmpQuaternion = new Quaternion();
	var rotationAxis = new Vector3();
	var getQuaternionRotationFromIndex = function (index) {
		//set the rotation axis for the quaternion
		rotationAxis.setDirect((index % 4 === 0) + (index % 2 === 0), 0.9, (index % 4 === 2) + (index % 2 === 1)).normalize();

		//rotate the rigidbody around the rotationAxis
		return tmpQuaternion.fromAngleNormalAxis(0.5, rotationAxis);
	};


	/**
	 * Casts a physics-system ray of a specific type and renders it.
	 * @param {Vector3} origin
	 * @param {Vector3} direction
	 * @param {number} length
	 * @param {Vector3} color The color used with the LineRenderSystem to draw a line.
	 * @param {number} castType The type of ray to cast; ALL, ANY or CLOSEST.
	 * @param {object} settings
	 * @constructor
	 */
	var RayCaster = function (origin, direction, length, color, castType, settings) {
		this.origin = new Vector3(origin);
		this.direction = new Vector3(direction);
		this.length = length;
		this.color = color;
		this.castType = castType;
		this.settings = settings;
	};

	RayCaster.endVector = new Vector3();

	RayCaster.ALL = 0;
	RayCaster.ANY = 1;
	RayCaster.CLOSEST = 2;

	RayCaster.rayCastResult = new RaycastResult();
	RayCaster.rayCastCallback = function (result) {
		drawNormal(result.point, result.normal);
	};

	RayCaster.prototype.cast = function () {

		switch (this.castType) {
			case RayCaster.ALL:
				physicsSystem.raycastAll(this.origin, this.direction, this.length, this.settings, RayCaster.rayCastCallback);
				break;
			case RayCaster.ANY:
				var result = RayCaster.rayCastResult;
				physicsSystem.raycastAny(this.origin, this.direction, this.length, this.settings, result);
				drawNormal(result.point, result.normal);
				break;
			case RayCaster.CLOSEST:
				var result = RayCaster.rayCastResult;
				physicsSystem.raycastClosest(this.origin, this.direction, this.length, this.settings, result);
				drawNormal(result.point, result.normal);
				break;
		}

		drawArrowedLine(this.origin, this.direction, this.length, world.time, this.color);
	};


	var colliderEntitys = [];

	var rayStart = new Vector3(-4, 0, 0);
	var rayCasters = [];

	var createScene = function () {

		var colliderEntitysPerRow = 4;
		var colliderEntitysPerColumn = 4;

		var colliderEntityPosition = new Vector3();

		for (var x = 0; x < colliderEntitysPerRow; x++) {
			for (var z = 0; z < colliderEntitysPerColumn; z++) {

				var currentIndex = x * colliderEntitysPerRow + z;

				//Boolean comparison to make a grid pattern.
				var isPrimitive = (z % 2) === (x % 2);

				var shapeType = (z + (x % 3)) % 3;

				colliderEntityPosition.setDirect(x, 0, z);

				var colliderEntity = new ColliderEntity(world, colliderEntityPosition, shapeType, isPrimitive);
				colliderEntity.rigidBodyComponent.initialize();
				colliderEntity.rigidBodyComponent.setQuaternion(getQuaternionRotationFromIndex(currentIndex));

				colliderEntitys.push(colliderEntity);
			}
		}

		var rayDirection = new Vector3(1, 0, 0);
		var rayLength = 8;

		rayCasters.push(new RayCaster(rayStart, rayDirection, rayLength, lineRenderSystem.RED, RayCaster.ALL, {skipBackfaces: true}));
		rayCasters.push(new RayCaster(rayStart, rayDirection, rayLength, lineRenderSystem.GREEN, RayCaster.ANY, {skipBackfaces: true}));
		rayCasters.push(new RayCaster(rayStart, rayDirection, rayLength, lineRenderSystem.WHITE, RayCaster.CLOSEST, {skipBackfaces: true}));
		rayCasters.push(new RayCaster(rayStart, rayDirection, rayLength, lineRenderSystem.MAGENTA, RayCaster.ALL, {skipBackfaces: false}));
	};

	createScene();

	var update = function () {
		for (var i = 0; i < rayCasters.length; i++) {
			rayStart.setDirect(-2, Math.cos(world.time) * 0.2, i + Math.sin(world.time) * 0.2);

			rayCasters[i].origin.setVector(rayStart);
			rayCasters[i].cast();
		}
	};

	goo.callbacks.push(update);

	V.process();

});