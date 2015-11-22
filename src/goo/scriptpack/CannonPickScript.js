var Vector3 = require('../math/Vector3');
var Scripts = require('../scripts/Scripts');
var ScriptUtils = require('../scripts/ScriptUtils');
var Renderer = require('../renderer/Renderer');
var Plane = require('../math/Plane');

function CannonPickScript() {
	var pickButton;
	var mouseState;
	var cannonSystem;
	var plane = new Plane();

	function getTouchCenter(touches) {
		var x1 = touches[0].clientX;
		var y1 = touches[0].clientY;
		var x2 = touches[1].clientX;
		var y2 = touches[1].clientY;
		var cx = (x1 + x2) / 2;
		var cy = (y1 + y2) / 2;
		return [cx, cy];
	}

	function setup(parameters, env) {
		pickButton = ['Any', 'Left', 'Middle', 'Right'].indexOf(parameters.pickButton) - 1;
		if (pickButton < -1) {
			pickButton = -1;
		}

		// Joint body
		cannonSystem = env.world.getSystem('CannonSystem');
		var shape = new CANNON.Sphere(0.1);
		var jointBody = env.jointBody = new CANNON.RigidBody(0, shape);
		jointBody.collisionFilterGroup = 2;
		jointBody.collisionFilterMask = 2;
		cannonSystem.world.add(jointBody);

		mouseState = {
			x: 0,
			y: 0,
			ox: 0,
			oy: 0,
			dx: 0,
			dy: 0,
			down: false
		};
		var listeners = env.listeners = {
			mousedown: function (event) {
				if (!parameters.whenUsed || env.entity === env.activeCameraEntity) {
					var button = event.button;
					if (button === 0) {
						if (event.altKey) {
							button = 2;
						} else if (event.shiftKey) {
							button = 1;
						}
					}
					if (button === pickButton || pickButton === -1) {
						mouseState.down = true;
						mouseState.ox = mouseState.x = event.clientX;
						mouseState.oy = mouseState.y = event.clientY;
					}
				}
			},
			mouseup: function (event) {
				var button = event.button;
				if (button === 0) {
					if (event.altKey) {
						button = 2;
					} else if (event.shiftKey) {
						button = 1;
					}
				}
				if (button === pickButton || pickButton === -1) {
					mouseState.down = false;
					mouseState.dx = mouseState.dy = 0;
				}
			},
			mousemove: function (event) {
				if (!parameters.whenUsed || env.entity === env.activeCameraEntity) {
					if (mouseState.down) {
						mouseState.x = event.clientX;
						mouseState.y = event.clientY;
						env.dirty = true;
					}
				}
			},
			mouseleave: function (/*event*/) {
				mouseState.down = false;
				mouseState.ox = mouseState.x;
				mouseState.oy = mouseState.y;
			},
			touchstart: function (event) {
				if (!parameters.whenUsed || env.entity === env.activeCameraEntity) {
					mouseState.down = (event.targetTouches.length === 2);
					if (!mouseState.down) { return; }

					var center = getTouchCenter(event.targetTouches);
					mouseState.ox = mouseState.x = center[0];
					mouseState.oy = mouseState.y = center[1];
				}
			},
			touchmove: function (event) {
				if (!parameters.whenUsed || env.entity === env.activeCameraEntity) {
					if (!mouseState.down) { return; }

					var center = getTouchCenter(event.targetTouches);
					mouseState.x = center[0];
					mouseState.y = center[1];
				}
			},
			touchend: function (/*event*/) {
				mouseState.down = false;
				mouseState.ox = mouseState.x;
				mouseState.oy = mouseState.y;
			}
		};
		for (var event in listeners) {
			env.domElement.addEventListener(event, listeners[event]);
		}
		env.dirty = true;
	}

	function update(params, env) {
		mouseState.dx = mouseState.x - mouseState.ox;
		mouseState.dy = mouseState.y - mouseState.oy;

		mouseState.ox = mouseState.x;
		mouseState.oy = mouseState.y;

		var mainCam = Renderer.mainCamera;

		if (mainCam && mouseState.down && !env.mouseConstraint) {
			// Shoot cannon.js ray. Not included in Goo Engine yet, so let's use it directly
			var bodies = [];
			var physicsEntities = env.world.by.system('CannonSystem').toArray();
			for (var i = 0; i < physicsEntities.length; i++) {
				var b = physicsEntities[i].cannonRigidbodyComponent.body;
				if (b && b.shape instanceof CANNON.Box && b.motionstate === CANNON.Body.DYNAMIC) { // Cannon only supports convex with ray intersection
					bodies.push(b);
				}
			}
			// Get pick ray
			var gooRay = mainCam.getPickRay(mouseState.x, mouseState.y, window.innerWidth, window.innerHeight);
			var origin = new CANNON.Vec3(gooRay.origin.x, gooRay.origin.y, gooRay.origin.z);
			var direction = new CANNON.Vec3(gooRay.direction.x, gooRay.direction.y, gooRay.direction.z);
			var r = new CANNON.Ray(origin, direction);
			var result = r.intersectBodies(bodies);
			if (result.length) {
				var b = result[0].body;
				var p = result[0].point;
				addMouseConstraint(params, env, p.x, p.y, p.z, b, gooRay.direction.scale(-1));
			}
		} else if (mainCam && mouseState.down && env.mouseConstraint && (mouseState.dx !== 0 || mouseState.dy !== 0)) {
			// Get the current mouse point on the moving plane
			var mainCam = Renderer.mainCamera;
			var gooRay = mainCam.getPickRay(mouseState.x, mouseState.y, window.innerWidth, window.innerHeight);
			var newPositionWorld = new Vector3();
			plane.rayIntersect(gooRay, newPositionWorld, true);
			moveJointToPoint(params, env, newPositionWorld);
		} else if (!mouseState.down) {
			// Remove constraint
			removeJointConstraint(params, env);
		}
	}

	function cleanup(parameters, environment) {
		for (var event in environment.listeners) {
			environment.domElement.removeEventListener(event, environment.listeners[event]);
		}
	}

	function addMouseConstraint(params, env, x, y, z, body, normal) {
		// The cannon body constrained by the mouse joint
		env.constrainedBody = body;

		// Vector to the clicked point, relative to the body
		var v1 = new CANNON.Vec3(x, y, z).vsub(env.constrainedBody.position);

		// Apply anti-quaternion to vector to tranform it into the local body coordinate system
		var antiRot = env.constrainedBody.quaternion.inverse();
		var pivot = antiRot.vmult(v1); // pivot is not in local body coordinates

		// Move the cannon click marker particle to the click position
		env.jointBody.position.set(x, y, z);

		// Create a new constraint
		// The pivot for the jointBody is zero
		env.mouseConstraint = new CANNON.PointToPointConstraint(env.constrainedBody, pivot, env.jointBody, new CANNON.Vec3(0, 0, 0));

		// Add the constriant to world
		cannonSystem.world.addConstraint(env.mouseConstraint);

		// Set plane distance from world origin by projecting world translation to plane normal
		var worldCenter = new Vector3(x, y, z);
		plane.constant = worldCenter.dot(normal);
		plane.normal.set(normal);
	}

	// This functions moves the transparent joint body to a new postion in space
	function moveJointToPoint(params, env, point) {
		// Move the joint body to a new position
		env.jointBody.position.set(point.x, point.y, point.z);
		env.mouseConstraint.update();
	}

	function removeJointConstraint(params, env) {
		// Remove constriant from world
		cannonSystem.world.removeConstraint(env.mouseConstraint);
		env.mouseConstraint = false;
	}

	return {
		setup: setup,
		update: update,
		cleanup: cleanup
	};
}

CannonPickScript.externals = {
	key: 'CannonPickScript',
	name: 'Cannon.js Body Pick',
	description: 'Enables the user to physically pick a Cannon.js physics body and drag it around.',
	parameters: [{
		key: 'whenUsed',
		type: 'boolean',
		'default': true
	}, {
		key: 'pickButton',
		name: 'Pan button',
		description: 'Pick with this button',
		type: 'string',
		control: 'select',
		'default': 'Any',
		options: ['Any', 'Left', 'Middle', 'Right']
	}, {
		key: 'useForceNormal',
		name: 'Use force normal',
		type: 'boolean',
		'default': false
	}, {
		key: 'forceNormal',
		name: 'Force normal',
		'default': [0, 0, 1],
		type: 'vec3'
	}]
};

module.exports = CannonPickScript;