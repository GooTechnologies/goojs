var Vector2 = require('../../math/Vector2');
var System = require('../../entities/systems/System');
var Body = require('p2/src/objects/Body');
var World = require('p2/src/objects/World');
var Rectangle = require('p2/src/objects/Rectangle');
var Circle = require('p2/src/objects/Circle');
var Plane = require('p2/src/objects/Plane');

/**
 * Handles integration with p2.js.
 * Depends on the global p2 object,
 * so load p2.js using a script tag before using this system.
 * See also {@link P2Component}
 * @extends System
 * @param {Object} [settings]
 * @param {Array<number>} [settings.gravity=[0,-9.82]]
 * @example-link http://code.gooengine.com/latest/visual-test/goo/addons/p2/p2-vtest.html Working example
 * @example
 * var p2System = new P2System({
 *     stepFrequency: 60,
 *     gravity: [0, -10]
 * });
 * goo.world.setSystem(p2System);
 */
function P2System(settings) {
	System.call(this, 'P2System', ['P2Component', 'TransformComponent']);

	settings = settings || {};

	this.physicsWorld = new World({
		gravity: settings.gravity || [0, -9.82]
	});
}

P2System.prototype = Object.create(System.prototype);
P2System.prototype.constructor = P2System;

P2System.prototype.inserted = function (entity) {
	var p2Component = entity.p2Component;
	var transformComponent = entity.transformComponent;

	// Create shapes
	var body = p2Component.body = new Body({
		mass: p2Component.mass,
		position: [
			transformComponent.transform.translation.x,
			transformComponent.transform.translation.y
		]
	});

	for (var i = 0; i < p2Component.shapes.length; i++) {
		var shape = p2Component.shapes[i],
			p2shape;
		switch (shape.type) {
			case 'box':
				p2shape = new Rectangle(shape.width, shape.height);
				break;
			case 'circle':
				p2shape = new Circle(shape.radius);
				break;
			case 'plane':
				p2shape = new Plane();
				break;
			default:
				throw new Error("p2 shape '" + shape.type + "' not recognized");
		}
		body.addShape(p2shape, shape.offset, shape.angle);
	}

	p2Component.body = body;
	updateTransform(transformComponent, p2Component, 1);

	this.physicsWorld.addBody(body);
};

P2System.prototype.deleted = function (entity) {
	var p2Component = entity.p2Component;

	//REVIEW: not gonna be true if you remove the component from the entity
	// gotta research how to do this properly
	if (p2Component) {
		this.physicsWorld.removeBody(p2Component.body);
	}
};

P2System.prototype.fixedUpdate = function (entities, fixedTpf) {
	this.physicsWorld.step(fixedTpf);
};

P2System.prototype.process = function (entities/*, tpf*/) {
	for (var i = 0; i < entities.length; i++) {
		var entity = entities[i];
		var component = entity.component;
		updateTransform(entity.transformComponent, component, this.world.interpolationTime);
	}
};

var previousPosition = new Vector2();
var position = new Vector2();
function updateTransform(transformComponent, component, t) {
	previousPosition.setArray(component.body.previousPosition);
	position.setArray(component.body.position);

	previousPosition.lerp(position, t);

	transformComponent.transform.translation.setDirect(previousPosition.x, previousPosition.y, 0);
	transformComponent.transform.rotation.fromAngles(0, 0, component.body.angle);
	transformComponent.setUpdated();
}

module.exports = P2System;