define([
	'goo/entities/systems/System',
	'goo/renderer/bounds/BoundingBox',
	'goo/renderer/bounds/BoundingSphere',
	'goo/math/Quaternion',
	'goo/shapes/Box',
	'goo/shapes/Quad',
	'goo/shapes/Sphere',
	'goo/renderer/MeshData'
],
/** @lends */
function(
	System,
	BoundingBox, //REVIEW: unused
	BoundingSphere, //REVIEW: unused
	Quaternion, //REVIEW: unused
	Box, //REVIEW: unused
	Quad, //REVIEW: unused
	Sphere, //REVIEW: unused
	MeshData //REVIEW: unused
) {
	'use strict';

	var p2 = window.p2;

	/**
	 * @class Handles integration with p2.js.
	 * Depends on the global p2 object,
	 * so load p2.js using a script tag before using this system.
	 * See also {@link P2Component}
	 * @extends System
	 * @param {Object}                      [settings]
	 * @param {number}                      settings.stepFrequency=60
	 * @param {Array.<number>}              settings.gravity=[0,-9.82]
	 * @example
	 * var p2System = new P2System({
	 *     stepFrequency: 60,
	 *     gravity: [0,-10]
	 * });
	 * goo.world.setSystem(p2System);
	 */
	function P2System(settings) {
		System.call(this, 'P2System', ['P2Component', 'TransformComponent']);

		settings = settings || {};

		var world = this.world = new p2.World({
			gravity: settings.gravity || [0, -9.82]
		});

		this.stepFrequency = settings.stepFrequency || 60;
	}

	P2System.prototype = Object.create(System.prototype);
	P2System.prototype.constructor = P2System;

	function updateTransform(transformComponent, p2Component){
		var position = p2Component.body.position,
			scale = p2Component.scale;

		//REVIEW: no spaces after '('; yes spaces before and after infix operators (+, -, *, ...)
		// also have a look at setTranslation and setRotation: they both do that setUpdated does
		// those 2 methods were added for the end user and do a lot of parameter parsing
		// I'd use transformComponent.transform.translation.setd(1, 2, 3);
		// and transformComponent.transform.rotation.fromAngles(1, 2, 3);
		// and setUpdated, of course
		transformComponent.setTranslation( position[0]*scale, position[1]*scale, 0);
		transformComponent.setRotation(p2Component.offsetAngleX,
									   p2Component.offsetAngleY,
									   p2Component.offsetAngleZ + p2Component.body.angle);
		transformComponent.setUpdated();
	}

	P2System.prototype.inserted = function(entity) {
		var p2Component = entity.p2Component;
		var transformComponent = entity.transformComponent;

		var body = new p2.Body({
			mass: p2Component.mass,
			damping: p2Component.damping,
			angularDamping: p2Component.angularDamping
		});

		// Create shapes
		var body = p2Component.body = new p2.Body({
			mass:p2Component.mass,
			position:[transformComponent.transform.translation.x,transformComponent.transform.translation.y]
		});

		//REVIEW: spaces, spaces, spaces
		for (var i = 0; i < p2Component.shapes.length; i++) {
			//REVIEW: no one-letter variables! p2Component.shapes contains things named 's' and not things named 'shape'?
			var s = p2Component.shapes[i],
				shape;
			switch(s.type){
				case 'box':
					shape = new p2.Rectangle(s.width,s.height);
					break;
				case 'circle':
					shape = new p2.Circle(s.radius);
					break;
				case 'plane':
					shape = new p2.Plane();
					break;
				default:
					throw new Error("p2 shape '" + s.type + "' not recognized");
			}
			body.addShape(shape, s.offset, s.angle);
		}

		p2Component.body = body;
		updateTransform(transformComponent, p2Component);

		this.world.addBody(body);
	};

	P2System.prototype.deleted = function(entity) {
		var p2Component = entity.p2Component;

		//REVIEW: not gonna be true if you remove the component from the entity
		// gotta research how to do this properly
		if (p2Component) {
			this.world.removeBody(p2Component.body);
		}
	};

	P2System.prototype.process = function(entities /*, tpf */) {
		this.world.step(1 / this.stepFrequency);

		for (var i = 0; i < entities.length; i++) {
			var entity = entities[i];
			var p2Component = entity.p2Component;
			updateTransform(entity.transformComponent, p2Component);
		}

	};

	return P2System;
});
