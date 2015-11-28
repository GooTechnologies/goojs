/* global goo, V */

V.describe(
	'<b>Red Line</b>: raycastAll<br>' +
	'<b>Green Line</b>: raycastAny<br>' +
	'<b>White Line</b>: raycastClosest<br>' +
	'<b>Magenta Line</b>: raycastAll - with backfaces<br>' +
	'<b>Yellow Shapes</b>: mesh colliders<br>' +
	'<b>Blue Shapes</b>: primitive colliders<br>');

var gooRunner = V.initGoo();
var world = gooRunner.world;
var lineRenderSystem = new goo.LineRenderSystem(world);
var physicsSystem = new goo.PhysicsSystem();

gooRunner.setRenderSystem(lineRenderSystem);

world.setSystem(physicsSystem);
world.setSystem(new goo.ColliderSystem());

V.addOrbitCamera(new goo.Vector3(9, Math.PI / 1.2, 0.7), new goo.Vector3(1.5, 0, 1.5));

var addDirectionalLight = function (directionArr) {
	var directionalLight = new goo.DirectionalLight();
	directionalLight.intensity = 0.5;
	directionalLight.specularIntensity = 1;
	var directionalLightEntity = world.createEntity(directionalLight, directionArr).addToWorld();
	directionalLightEntity.transformComponent.transform.lookAt(new goo.Vector3(0, 0, 0), goo.Vector3.UNIT_Y);
};

addDirectionalLight([1, 1, -1]);
addDirectionalLight([-1, -1, -1]);

var createMaterial = function (materialName, color) {
	var material = new goo.Material(materialName, goo.ShaderLib.uber);
	material.uniforms.materialAmbient = [color[0], color[1], color[2], color[3]];
	material.uniforms.opacity = 0.6;
	material.blendState.blending = 'CustomBlending';
	material.renderQueue = goo.RenderQueue.TRANSPARENT;
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
		this.shape = new goo.Sphere(8, 8, 0.5);
		this.shapeCollider = new goo.SphereCollider({radius: this.shape.radius});
		break;
	case ColliderEntity.BOX:
		this.shape = new goo.Box(0.5, 0.5);
		this.shapeCollider = new goo.BoxCollider({halfExtents: new goo.Vector3(this.shape.xExtent, this.shape.yExtent, this.shape.zExtent)});
		break;
	case ColliderEntity.CYLINDER:
		this.shape = new goo.Cylinder(8, 0.25, 0.25, 0.5);
		this.shapeCollider = new goo.CylinderCollider({radius: this.shape.radiusTop, height: this.shape.height});
		break;
	}

	if (this.isPrimitive) {
		this.material = ColliderEntity.PRIMITIVE_COLLIDER_MATERIAL;
	}
	else {
		this.material = ColliderEntity.MESH_COLLIDER_MATERIAL;
		this.shapeCollider = new goo.MeshCollider({meshData: this.shape});
	}

	this.rigidBodyComponent = new goo.RigidBodyComponent({mass: 0});
	this.colliderComponent = new goo.ColliderComponent({collider: this.shapeCollider});

	this.entity = this.world.createEntity(this.shape, this.material, position, this.rigidBodyComponent, this.colliderComponent).addToWorld();
};

var normalEndPosition = new goo.Vector3();
var drawNormal = function (position, normal) {
	normalEndPosition.set(normal).scale(0.5).add(position);

	lineRenderSystem.drawLine(position, normalEndPosition, lineRenderSystem.BLUE);
};

var arrowStartPosition = new goo.Vector3();
var arrowEndPosition = new goo.Vector3();
var arrowDirection = new goo.Vector3();
var drawLineArrow = function (origin, direction, length, fraction, color, width) {

	arrowStartPosition.set(direction).scale(length * fraction).add(origin);
	arrowEndPosition.set(direction).scale(-width).add(arrowStartPosition);

	var arrowUpDirection = arrowDirection.set(goo.Vector3.UNIT_Y).scale(width);
	arrowUpDirection.add(arrowEndPosition);

	lineRenderSystem.drawLine(arrowStartPosition, arrowUpDirection, color);

	var arrowDownDirection = arrowDirection.sub(arrowEndPosition);
	arrowDownDirection.scale(-1);
	arrowDownDirection.add(arrowEndPosition);

	lineRenderSystem.drawLine(arrowStartPosition, arrowDownDirection, color);
};

var lineEndVector = new goo.Vector3();
var drawArrowedLine = function (origin, direction, length, time, color) {

	var lengthRound = Math.round(length);

	var lengthFraction = 1 / lengthRound;

	var arrowOffset = (time * lengthFraction) % lengthFraction;
	for (var i = 0; i < lengthRound; i++) {
		var frac = i * lengthFraction + arrowOffset;
		drawLineArrow(origin, direction, length, frac, color, 0.05);
	}

	lineEndVector.set(direction).scale(length).add(origin);
	lineRenderSystem.drawLine(origin, lineEndVector, color);
};


var tmpQuaternion = new goo.Quaternion();
var rotationAxis = new goo.Vector3();
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
	this.origin = new goo.Vector3(origin);
	this.direction = new goo.Vector3(direction);
	this.length = length;
	this.color = color;
	this.castType = castType;
	this.settings = settings;
};

RayCaster.endVector = new goo.Vector3();

RayCaster.ALL = 0;
RayCaster.ANY = 1;
RayCaster.CLOSEST = 2;

RayCaster.rayCastResult = new goo.RaycastResult();
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

var rayStart = new goo.Vector3(-4, 0, 0);
var rayCasters = [];

var createScene = function () {

	var colliderEntitysPerRow = 4;
	var colliderEntitysPerColumn = 4;

	var colliderEntityPosition = new goo.Vector3();

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

	var rayDirection = new goo.Vector3(1, 0, 0);
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

		rayCasters[i].origin.set(rayStart);
		rayCasters[i].cast();
	}
};

gooRunner.callbacks.push(update);

V.process();