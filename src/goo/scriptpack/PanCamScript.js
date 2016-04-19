var Vector3 = require('../math/Vector3');
var Renderer = require('../renderer/Renderer');
var SystemBus = require('../entities/SystemBus');
var Camera = require('../renderer/Camera');

function PanCamScript() {
	var fwdVector, leftVector, calcVector, calcVector2;
	var lookAtPoint;
	var mouseState;
	var listeners;

	function getTouchCenter(touches) {
		var cx = 0;
		var cy = 0;

		var x1 = touches[0].clientX;
		var y1 = touches[0].clientY;
		if (touches.length >= 2) {
			var x2 = touches[1].clientX;
			var y2 = touches[1].clientY;
			cx = (x1 + x2) / 2;
			cy = (y1 + y2) / 2;
		} else {
			cx = x1;
			cy = y1;
		}
		return [cx, cy];
	}

	function setup(parameters, environment) {
		argsUpdated(parameters, environment);

		lookAtPoint = environment.goingToLookAt;
		fwdVector = Vector3.UNIT_Y.clone();
		leftVector = Vector3.UNIT_X.clone().negate();
		calcVector = new Vector3();
		calcVector2 = new Vector3();

		var renderer = environment.world.gooRunner.renderer;
		environment.devicePixelRatio = renderer._useDevicePixelRatio && window.devicePixelRatio ?
			window.devicePixelRatio / renderer.svg.currentScale : 1;

		mouseState = {
			x: 0,
			y: 0,
			ox: 0,
			oy: 0,
			dx: 0,
			dy: 0,
			down: false
		};
		listeners = {
			mousedown: function (event) {
				if (!parameters.whenUsed || environment.entity === environment.activeCameraEntity) {
					var button = event.button;
					if (button === 0) {
						if (event.altKey) {
							button = 2;
						} else if (event.shiftKey) {
							button = 1;
						}
					}
					if (button === environment.panButton || environment.panButton === -1) {
						mouseState.down = true;
						var x = (event.offsetX !== undefined) ? event.offsetX : event.layerX;
						var y = (event.offsetY !== undefined) ? event.offsetY : event.layerY;
						mouseState.ox = mouseState.x = x;
						mouseState.oy = mouseState.y = y;
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
				mouseState.down = false;
				mouseState.dx = mouseState.dy = 0;
			},
			mousemove: function (event) {
				if (!parameters.whenUsed || environment.entity === environment.activeCameraEntity) {
					if (mouseState.down) {
						var x = (event.offsetX !== undefined) ? event.offsetX : event.layerX;
						var y = (event.offsetY !== undefined) ? event.offsetY : event.layerY;
						mouseState.x = x;
						mouseState.y = y;
						environment.dirty = true;
					}
				}
			},
			mouseleave: function (/*event*/) {
				mouseState.down = false;
				mouseState.ox = mouseState.x;
				mouseState.oy = mouseState.y;
			},
			touchstart: function (event) {
				if (!parameters.whenUsed || environment.entity === environment.activeCameraEntity) {
					mouseState.down = (parameters.touchMode === 'Any' || (parameters.touchMode === 'Single' && event.targetTouches.length === 1) || (parameters.touchMode === 'Double' && event.targetTouches.length === 2));
					if (!mouseState.down) { return; }

					var center = getTouchCenter(event.targetTouches);
					mouseState.ox = mouseState.x = center[0];
					mouseState.oy = mouseState.y = center[1];
				}
			},
			touchmove: function (event) {
				if (!parameters.whenUsed || environment.entity === environment.activeCameraEntity) {
					if (!mouseState.down) { return; }

					var center = getTouchCenter(event.targetTouches);
					mouseState.x = center[0];
					mouseState.y = center[1];
					environment.dirty = true;
				}
			},
			touchend: function (/*event*/) {
				mouseState.down = false;
				mouseState.ox = mouseState.x;
				mouseState.oy = mouseState.y;
			}
		};
		for (var event in listeners) {
			environment.domElement.addEventListener(event, listeners[event]);
		}
		environment.dirty = true;
	}

	function update(parameters, environment) {
		if (!environment.dirty) {
			return;
		}
		mouseState.dx = mouseState.x - mouseState.ox;
		mouseState.dy = mouseState.y - mouseState.oy;
		if (mouseState.dx === 0 && mouseState.dy === 0) {
			environment.dirty = !!environment.lookAtPoint;
			return;
		}

		if (parameters.invertX) {
			mouseState.dx = -mouseState.dx;
		}
		if (parameters.invertY) {
			mouseState.dy = -mouseState.dy;
		}

		mouseState.ox = mouseState.x;
		mouseState.oy = mouseState.y;

		var mainCam = Renderer.mainCamera;

		var entity = environment.entity;
		var transform = entity.transformComponent.transform;

		var camera = entity.cameraComponent.camera;
		if (lookAtPoint && mainCam) {
			if (lookAtPoint.equals(mainCam.translation)) {
				return;
			}
			var width = environment.viewportWidth / environment.devicePixelRatio;
			var height = environment.viewportHeight / environment.devicePixelRatio;
			mainCam.getScreenCoordinates(lookAtPoint, width, height, calcVector);
			calcVector.subDirect(
				mouseState.dx,/// (environment.viewportWidth/devicePixelRatio),
				mouseState.dy,/// (environment.viewportHeight/devicePixelRatio),
				0
			);
			mainCam.getWorldCoordinates(
				calcVector.x,
				calcVector.y,
				width,
				height,
				calcVector.z,
				calcVector
			);
			lookAtPoint.set(calcVector);
		} else {
			calcVector.set(fwdVector).scale(mouseState.dy);
			calcVector2.set(leftVector).scale(mouseState.dx);

			//! schteppe: use world coordinates for both by default?
			//if (parameters.screenMove) {
				// In the case of screenMove, we normalize the camera movement
				// to the near plane instead of using pixels. This makes the parallel
				// camera map mouse world movement to camera movement 1-1
			if (entity.cameraComponent && entity.cameraComponent.camera) {
				var camera = entity.cameraComponent.camera;
				calcVector.scale((camera._frustumTop - camera._frustumBottom) / environment.viewportHeight);
				calcVector2.scale((camera._frustumRight - camera._frustumLeft) / environment.viewportWidth);
			}
			//}
			calcVector.add(calcVector2);
			calcVector.applyPost(transform.rotation);
			//if (!parameters.screenMove) {
				// panSpeed should be 1 in the screenMove case, to make movement sync properly
			if (camera.projectionMode === Camera.Perspective) {
				// RB: I know, very arbitrary but looks ok
				calcVector.scale(parameters.panSpeed * 20);
			} else {
				calcVector.scale(parameters.panSpeed);
			}
			entity.transformComponent.transform.translation.add(calcVector);
			entity.transformComponent.setUpdated();
			environment.dirty = false;
		}
		SystemBus.emit('goo.cameraPositionChanged', {
			translation: transform.translation.toArray(),
			lookAtPoint: lookAtPoint ? lookAtPoint.toArray() : null,
			id: entity.id
		});
	}

	function cleanup(parameters, environment) {
		for (var event in listeners) {
			environment.domElement.removeEventListener(event, listeners[event]);
		}
	}

	function argsUpdated(parameters, environment) {
		environment.panButton = ['Any', 'Left', 'Middle', 'Right'].indexOf(parameters.panButton) - 1;
		if (environment.panButton < -1) {
			environment.panButton = -1;
		}
		environment.dirty = true;
	}

	return {
		setup: setup,
		update: update,
		cleanup: cleanup,
		argsUpdated: argsUpdated
	};
}

PanCamScript.externals = {
	key: 'PanCamControlScript',
	name: 'PanCamera Control',
	description: 'Enables camera to pan around a point in 3D space using the mouse',
	parameters: [{
		key: 'whenUsed',
		type: 'boolean',
		name: 'When Camera Used',
		description: 'Script only runs when the camera to which it is added is being used.',
		'default': true
	}, {
		key: 'panButton',
		name: 'Pan button',
		description: 'Only pan with this button',
		type: 'string',
		control: 'select',
		'default': 'Any',
		options: ['Any', 'Left', 'Middle', 'Right']
	}, {
		key: 'touchMode',
		description: 'Number of fingers needed to trigger panning.',
		type: 'string',
		control: 'select',
		'default': 'Double',
		options: ['Any', 'Single', 'Double']
	}, {
		key: 'panSpeed',
		type: 'float',
		'default': 1,
		scale: 0.01
	}/*, {
		key: 'screenMove',
		type: 'boolean',
		'default': false,
		description: 'Syncs camera movement with mouse world position 1-1, needed for parallel camera.'
	}*/]
};

module.exports = PanCamScript;