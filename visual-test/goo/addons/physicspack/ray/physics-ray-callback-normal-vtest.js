require([
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/shapes/Box',
	'goo/shapes/Torus',
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
			 Box,
			 Torus,
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

	V.describe("3 primitive MeshCollider's and a ray, drawing a blue normal line from each hit point");

	var goo = V.initGoo();
	var world = goo.world;
	var LRS = new LineRenderSystem(world);
	var physicsSystem = new PhysicsSystem();

	world.setSystem(LRS);
	world.setSystem(physicsSystem);
	world.setSystem(new ColliderSystem());

	V.addOrbitCamera(new Vector3(8, Math.PI / 1.3, 0.5));
	V.addLights();

	var material;
	var rigidBodyComponent;
	var rigidBodys = [];
	var colliderComponent;

	//create a sphere primitive
	material = new Material('Material1', ShaderLib.uber);
	material.uniforms.materialAmbient = [0.5, 0, 0, 1];
	var sphere0 = new Sphere(4, 8, 0.5);
	rigidBodyComponent = new RigidbodyComponent({mass: 0});
	rigidBodys.push(rigidBodyComponent);
	colliderComponent = new ColliderComponent({collider: new MeshCollider({meshData: sphere0})});
	world.createEntity(sphere0, material, [-1.2, 0, 0], rigidBodyComponent, colliderComponent).addToWorld();


	//create the a box primitive
	material = new Material('Material2', ShaderLib.uber);
	material.uniforms.materialAmbient = [0.5, 0, 0.5, 1];
	var box0 = new Box(0.5, 0.5, 0.5);
	rigidBodyComponent = new RigidbodyComponent({mass: 0});
	rigidBodys.push(rigidBodyComponent);
	colliderComponent = new ColliderComponent({collider: new MeshCollider({meshData: box0})});
	world.createEntity(box0, material, [0, 0, 0], rigidBodyComponent, colliderComponent).addToWorld();


	//create a torus primitive
	material = new Material('Material3', ShaderLib.uber);
	material.uniforms.materialAmbient = [0, 0, 0.5, 1];
	var torus0 = new Torus(20, 20, 0.2, 0.5);
	rigidBodyComponent = new RigidbodyComponent({mass: 0});
	rigidBodys.push(rigidBodyComponent);
	colliderComponent = new ColliderComponent({collider: new MeshCollider({meshData: torus0})});
	world.createEntity(torus0, material, [1.2, 0, 0], rigidBodyComponent, colliderComponent).addToWorld();


	var rayStart = new Vector3(-4, 0, 0);
	var rayDirection = new Vector3(1, 0, 0);
	var rayLength = 10;

	var rayEnd = new Vector3();

	var normalEndPosition = new Vector3();

	var callback = function (result) {
		var normalStartPosition = result.point;
		normalEndPosition.setVector(result.normal).mul(0.5).addVector(normalStartPosition);

		LRS.drawLine(normalStartPosition, normalEndPosition, LRS.BLUE);
	};

	var tmpQuaternion = new Quaternion();
	var rotationAxis = new Vector3();
	var rotateRigidBodys = function () {
		for (var i = 0; i < rigidBodys.length; i++) {
			var rigidBody = rigidBodys[i];

			//set the rotation axis unique for each of the 3 rigidbodys
			rotationAxis.setDirect((i===2), (i===1), (i===0));

			//rotate the rigidbody around the rotationAxis
			rigidBody.setQuaternion(tmpQuaternion.fromAngleNormalAxis(Math.sin(world.time*0.7), rotationAxis));
		}
	};

	var update = function () {

		rotateRigidBodys();

		rayStart.setDirect(-3, 0, Math.sin(world.time) * 0.3);
		rayDirection.setDirect(0.85, Math.sin(world.time) * 0.09, Math.cos(world.time * 0.9) * 0.1).normalize();

		//var result = new RaycastResult();
		var hit = physicsSystem.raycastAll(rayStart, rayDirection, rayLength, {skipBackfaces: true}, callback);

		//callback(result);


		rayEnd.setVector(rayDirection).mul(rayLength).addVector(rayStart);
		if (hit) {
			LRS.drawLine(rayStart, rayEnd, LRS.GREEN);
		}
		else {
			LRS.drawLine(rayStart, rayEnd, LRS.RED);
		}

		LRS.drawCross(rayStart, LRS.YELLOW);
	};

	goo.callbacks.push(update);

	V.process();
});