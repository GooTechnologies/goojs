define([
	'goo/entities/systems/System'
], function (
	System
) {
	'use strict';

	var p2 = window.p2;

	/**
	 * Handles integration with p2.js.
	 * Depends on the global p2 object,
	 * so load p2.js using a script tag before using this system.
	 * See also {@link P2Component}
	 * @extends System
	 * @param {Object} [settings]
	 * @param {number} [settings.stepFrequency=60]
	 * @param {Array.<number>} [settings.gravity=[0, -9.82]]
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

		this.world = new p2.World({
			gravity: settings.gravity || [0, -9.82]
		});

		this.stepFrequency = settings.stepFrequency || 60;
	}

	P2System.prototype = Object.create(System.prototype);
	P2System.prototype.constructor = P2System;

	function updateTransform(transformComponent, p2Component) {
		var position = p2Component.body.position,
			scale = p2Component.scale;

		transformComponent.transform.translation.setDirect(position[0] * scale, position[1] * scale, 0);
		transformComponent.transform.rotation.fromAngles(p2Component.offsetAngleX, p2Component.offsetAngleY, p2Component.offsetAngleZ + p2Component.body.angle);
		transformComponent.setUpdated();
	}

	P2System.prototype.inserted = function (entity) {
		var p2Component = entity.p2Component;
		var transformComponent = entity.transformComponent;

		// what's up with this body?! it gets overridden by the following one!
		var body = new p2.Body({
			mass: p2Component.mass,
			damping: p2Component.damping,
			angularDamping: p2Component.angularDamping
		});

		// Create shapes
		var body = p2Component.body = new p2.Body({
			mass: p2Component.mass,
			position: [transformComponent.transform.translation.x, transformComponent.transform.translation.y]
		});

		for (var i = 0; i < p2Component.shapes.length; i++) {
			var shape = p2Component.shapes[i],
				p2shape;
			switch (shape.type) {
				case 'box':
					p2shape = new p2.Rectangle(shape.width, shape.height);
					break;
				case 'circle':
					p2shape = new p2.Circle(shape.radius);
					break;
				case 'plane':
					p2shape = new p2.Plane();
					break;
				default:
					throw new Error("p2 shape '" + shape.type + "' not recognized");
			}
			body.addShape(p2shape, shape.offset, shape.angle);
		}

		p2Component.body = body;
		updateTransform(transformComponent, p2Component);

		this.world.addBody(body);
	};

	P2System.prototype.deleted = function (entity) {
		var p2Component = entity.p2Component;

		//REVIEW: not gonna be true if you remove the component from the entity
		// gotta research how to do this properly
		if (p2Component) {
			this.world.removeBody(p2Component.body);
		}
	};

	P2System.prototype.process = function (entities /*, tpf */) {
		this.world.step(1 / this.stepFrequency);

		for (var i = 0; i < entities.length; i++) {
			var entity = entities[i];
			var p2Component = entity.p2Component;
			updateTransform(entity.transformComponent, p2Component);
		}
	};

	return P2System;
});
