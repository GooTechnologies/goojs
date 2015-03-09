require([
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
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

	V.describe("Contains a color coded ray-casting visual-test for each vital feature in the ray API of the physicspack.");

	var goo = V.initGoo();
	var world = goo.world;
	var lineRenderSystem = new LineRenderSystem(world);
	var physicsSystem = new PhysicsSystem();

	goo.setRenderSystem(lineRenderSystem);

	world.setSystem(physicsSystem);
	world.setSystem(new ColliderSystem());

	V.addOrbitCamera(new Vector3(8, Math.PI / 1.3, 0.5));

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
	var rigidBodys = [];
	var colliderComponent;


	var meshColliderMaterial = new Material('MeshColliderMaterial', ShaderLib.uber);
	meshColliderMaterial.uniforms.materialAmbient = [0.5, 0.5, 0, 1];

	var primitiveColliderMaterial = new Material('PrimitiveColliderMaterial', ShaderLib.uber);
	primitiveColliderMaterial.uniforms.materialAmbient = [0.0, 0.5, 0.5, 1];

	var numBodiesPerRow = 4;
	var numBodies = numBodiesPerRow*numBodiesPerRow;
	var halfNumBodies = numBodies * 0.5;

	for (var i = 0; i < numBodies; i++) {

		var isPrimitiveCollider = false;

		//default material is MeshColliderMaterial
		var material = meshColliderMaterial;


		if (i > halfNumBodies) {
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
		rigidBodys.push(rigidBodyComponent);
		colliderComponent = new ColliderComponent({collider: shapeCollider});
		world.createEntity(shape, material, [i%numBodiesPerRow, 0, Math.floor(i/numBodiesPerRow)], rigidBodyComponent, colliderComponent).addToWorld();
	}


	var rayStart = new Vector3(-4, 0, 0);
	var rayDirection = new Vector3(1, 0, 0);
	var rayLength = 10;

	var rayEnd = new Vector3();

	var normalEndPosition = new Vector3();

	var callback = function (result) {
		var normalStartPosition = result.point;
		normalEndPosition.setVector(result.normal).mul(0.5).addVector(normalStartPosition);

		lineRenderSystem.drawLine(normalStartPosition, normalEndPosition, lineRenderSystem.BLUE);
	};

	var tmpQuaternion = new Quaternion();
	var rotationAxis = new Vector3();
	var rotateRigidBodys = function () {
		for (var i = 0; i < rigidBodys.length; i++) {
			var rigidBody = rigidBodys[i];

			//set the rotation axis unique for the rigidbodies
			rotationAxis.setDirect((i % 4 === 0), (i % 4 === 1), (i % 4 === 2));

			//rotate the rigidbody around the rotationAxis
			rigidBody.setQuaternion(tmpQuaternion.fromAngleNormalAxis(Math.sin(world.time * 0.7), rotationAxis));
		}
	};

	var update = function () {

		rotateRigidBodys();

		rayStart.setDirect(-3, 0, Math.sin(world.time) * 0.3);
		rayDirection.setDirect(0.85, 0, 0).normalize();

		//var result = new RaycastResult();
		var hit = physicsSystem.raycastAll(rayStart, rayDirection, rayLength, {skipBackfaces: true}, callback);

		//callback(result);


		rayEnd.setVector(rayDirection).mul(rayLength).addVector(rayStart);
		if (hit) {
			lineRenderSystem.drawLine(rayStart, rayEnd, lineRenderSystem.GREEN);
		}
		else {
			lineRenderSystem.drawLine(rayStart, rayEnd, lineRenderSystem.RED);
		}

		lineRenderSystem.drawCross(rayStart, lineRenderSystem.YELLOW);
	};

	goo.callbacks.push(update);

	V.process();
});