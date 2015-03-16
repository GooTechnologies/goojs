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

	V.addOrbitCamera(new Vector3(9, Math.PI / 1.15, 0.5), new Vector3(1.5, 0, 1.5));

	var addDirectionalLight = function (directionArr) {
		var directionalLight = new DirectionalLight();
		directionalLight.intensity = 0.5;
		directionalLight.specularIntensity = 1;
		var directionalLightEntity = world.createEntity(directionalLight, directionArr).addToWorld();
		directionalLightEntity.transformComponent.transform.lookAt(new Vector3(0, 0, 0), Vector3.UNIT_Y);
	};

	addDirectionalLight([1, 1, -1]);
	addDirectionalLight([-1, -1, -1]);


	var rigidBodyComponent;
	var rigidBodies = [];
	var colliderComponent;

	var createMaterial = function (materialName, color) {
		var material = new Material(materialName, ShaderLib.uber);
		material.uniforms.materialAmbient = [color[0], color[1], color[2], color[3]];
		material.uniforms.opacity = 0.6;
		material.blendState.blending = 'CustomBlending';
		material.renderQueue = RenderQueue.TRANSPARENT;
		material.depthState.write = false;

		return material;
	};

	var meshColliderMaterial = createMaterial('MeshColliderMaterial', [0.5, 0.5, 0, 1]);
	var primitiveColliderMaterial = createMaterial('PrimitiveColliderMaterial', [0.0, 0.5, 0.5, 1]);

	var numBodiesPerRow = 4;
	var numBodies = numBodiesPerRow * numBodiesPerRow;

	var PrimitiveColliderEntity = function(){
		//TODO: WRITE PRIMITIVE COLLIDER ENTITY AND ADD MESH COLLIDER MATERIAL TO THE CLASS
	};

	PrimitiveColliderEntity.SPHERE = 0;
	PrimitiveColliderEntity.BOX = 1;
	PrimitiveColliderEntity.CYLINDER = 2;

	PrimitiveColliderEntity.MESH_COLLIDER_MATERIAL = createMaterial('MeshColliderMaterial', [0.5, 0.5, 0, 1]);

	for (var i = 0; i < numBodies; i++) {

		var isPrimitiveCollider = false;

		//default material is MeshColliderMaterial
		var material = meshColliderMaterial;


		if (i % 2) {
			isPrimitiveCollider = true;
		}

		if (isPrimitiveCollider) {
			material = primitiveColliderMaterial;
		}

		var shape = null;
		var shapeCollider = null;

		//switch-case for all the different type of primitive shapes
		switch (i % 3) {
			case 0: //sphere
				shape = new Sphere(8, 8, 0.5);

				if (isPrimitiveCollider) {
					shapeCollider = new SphereCollider({radius: shape.radius});
				}
				break;
			case 1: //box
				shape = new Box(0.5, 0.5);

				if (isPrimitiveCollider) {
					shapeCollider = new BoxCollider({halfExtents: new Vector3(shape.xExtent, shape.yExtent, shape.zExtent)});
				}
				break;
			case 2: //cylinder
				shape = new Cylinder(8, 0.25, 0.25, 0.5);

				if (isPrimitiveCollider) {
					shapeCollider = new CylinderCollider({radius: shape.radiusTop, height: shape.height});
				}
				break;
		}

		if (!isPrimitiveCollider) {
			shapeCollider = new MeshCollider({meshData: shape});
		}

		rigidBodyComponent = new RigidbodyComponent({mass: 0});
		rigidBodies.push(rigidBodyComponent);
		colliderComponent = new ColliderComponent({collider: shapeCollider});
		world.createEntity(shape, material, [i % numBodiesPerRow, 0, Math.floor(i / numBodiesPerRow)], rigidBodyComponent, colliderComponent).addToWorld();
	}


	var rayStart = new Vector3(-4, 0, 0);
	var rayDirection = new Vector3(1, 0, 0);
	var rayLength = 8;

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
	var rotateRigidBodies = function () {
		for (var i = 0; i < rigidBodies.length; i++) {
			var rigidBody = rigidBodies[i];

			//set the rotation axis for the quaternion
			rotationAxis.setDirect((i % 4 === 0) + (i % 2 === 0), 0.9, (i % 4 === 2) + (i % 2 === 1)).normalize();

			//rotate the rigidbody around the rotationAxis
			rigidBody.setQuaternion(tmpQuaternion.fromAngleNormalAxis(Math.sin(world.time * 0.7), rotationAxis));
		}
	};

	var RayCaster = function (origin, direction, length, color, type, settings) {
		this.origin = new Vector3(origin);
		this.direction = new Vector3(direction);
		this.length = length;
		this.color = color;
		this.type = type;
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

		switch (this.type) {
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


	var rayCasters = [];

	rayCasters[0] = new RayCaster(rayStart, rayDirection, rayLength, lineRenderSystem.RED, RayCaster.ALL, {skipBackfaces: true});
	rayCasters[1] = new RayCaster(rayStart, rayDirection, rayLength, lineRenderSystem.GREEN, RayCaster.ANY, {skipBackfaces: true});
	rayCasters[2] = new RayCaster(rayStart, rayDirection, rayLength, lineRenderSystem.WHITE, RayCaster.CLOSEST, {skipBackfaces: true});
	rayCasters[3] = new RayCaster(rayStart, rayDirection, rayLength, lineRenderSystem.MAGENTA, RayCaster.ALL, {skipBackfaces: false});

	var update = function () {

		rotateRigidBodies();

		for (var i = 0; i < rayCasters.length; i++) {
			rayStart.setDirect(-2, Math.cos(world.time) * 0.2, i + Math.sin(world.time) * 0.2);

			rayCasters[i].origin.setVector(rayStart);
			rayCasters[i].cast();
		}
	};

	goo.callbacks.push(update);

	V.process();

});