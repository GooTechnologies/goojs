define([
	'goo/scripts/OrbitCamControlScript',
	'goo/renderer/Renderer',
	'goo/math/Vector3',
	'goo/math/MathUtils'
], function(
	OrbitCamControlScript,
	Renderer,
	Vector3,
	MathUtils
) {
	"use strict";

// REVIEW: I think a bit of jsDoc would be a great idea and maybe a short introduction what this class does.
	/**
	 * @class Enables camera to orbit around a point in 3D space using the right mouse button, while panning with the middle button.
	 * @extends OrbitCamControlScript
	 * @param {Object} [properties]
	 * @param {Element} [properties.domElement=document] Element to add mouse listeners to
	 * @param {number} [properties.turnSpeedHorizontal=0.005]
	 * @param {number} [properties.turnSpeedVertical=0.005]
	 * @param {number} [properties.zoomSpeed=0.2]
	 * @param {boolean} [properties.dragOnly=true] Only move the camera when dragging
	 * @param {Vector3} [properties.worldUpVector=Vector3(0,1,0)]
	 * @param {number} [properties.minZoomDistance=1]
	 * @param {number} [properties.maxZoomDistance=1000]
	 * @parma {number} [properties.detailZoom=0.15] Multiplies the zoom when using shift+zoom to enable smaller zoom increments.
	 * @param {number} [properties.minAscent=-89.95 * MathUtils.DEG_TO_RAD] Maximum arc (in radians) the camera can reach below the target point
	 * @param {number} [properties.maxAscent=89.95 * MathUtils.DEG_TO_RAD] Maximum arc (in radians) the camera can reach above the target point
	 * @param {boolean} [properties.clampAzimuth=false]
	 * @param {number} [properties.minAzimuth=-90 * MathUtils.DEG_TO_RAD] Maximum arc (in radians) the camera can reach clockwise of the target point
	 * @param {number} [properties.maxAzimuth=270 * MathUtils.DEG_TO_RAD] Maximum arc (in radians) the camera can reach counter-clockwise of the target point
	 * @param {boolean} [properties.invertedX=false]
	 * @param {boolean} [properties.invertedY=false]
	 * @param {boolean} [properties.invertedWheel=true]
	 * @param {Vector3} [properties.lookAtPoint=Vector3(0,0,0)] The point to orbit around.
	 * @param {Vector3} [properties.spherical=Vector3(15,0,0)] The initial position of the camera given in spherical coordinates (r, theta, phi).
	 * Theta is the angle from the x-axis towards the z-axis, and phi is the angle from the xz-plane towards the y-axis. Some examples:
	 * <ul>
	 * <li>View from right: <code>new Vector3(15,0,0); // y is up and z is left</code> </li>
	 * <li>View from front: <code>new Vector3(15, Math.PI/2, 0) // y is up and x is right </code> </li>
	 * <li>View from top: <code>new Vector3(15,Math.PI/2,Math.PI/2) // z is down and x is right</code> </li>
	 * <li>View from top-right corner: <code>new Vector3(15, Math.PI/3, Math.PI/8)</code> </li>
	 * </ul>
	 */
	function OrbitNPanControlScript(properties) {
		properties = properties || {};
		// REVIEW: move this detail zoom to OrbitCamControlScript
		this.detailZoom = properties.detailZoom || 0.15;
		this.zoomDistanceFactor = properties.zoomDistanceFactor || 0.035;
		OrbitCamControlScript.call(this, properties);
		this.panState = {
			buttonDown : false,
			lastX: NaN,
			lastY: NaN,
			lastPos: new Vector3()
		};
		this.viewportWidth = 0;
		this.viewportHeight = 0;
		this.shiftKey = false;
		this.altKey = false;
		this.goingToLookAt = new Vector3().setv(this.lookAtPoint);
	}

	OrbitNPanControlScript.prototype = Object.create(OrbitCamControlScript.prototype);

	OrbitNPanControlScript.prototype.setupMouseControls = function() {
		var that = this;
		this.domElement.addEventListener('mousedown', function (event) {
			that.shiftKey = event.shiftKey;
			that.altKey = event.altKey;

			that.updateButtonState(event.button, true, event);
		}, false);

		document.addEventListener('mouseup', function (event) {
			that.updateButtonState(event.button, false, event);
		}, false);

		document.addEventListener('mousemove', function (event) {
			that.updateDeltas(event.clientX, event.clientY);
		}, false);

		this.domElement.addEventListener('mousewheel', function (event) {
			that.shiftKey = event.shiftKey;
			that.applyWheel(event.wheelDelta || -event.detail);
		}, false);
		this.domElement.addEventListener('DOMMouseScroll', function (event) {
			that.shiftKey = event.shiftKey;
			that.applyWheel(event.wheelDelta || -event.detail);
		}, false);


		// Avoid missing the mouseup event because of Chrome bug:
		// https://code.google.com/p/chromium/issues/detail?id=244289
		this.domElement.addEventListener('dragstart', function (event) {
			event.preventDefault();
		}, false);
		this.domElement.oncontextmenu = function() { return false; };


		// optional touch controls... requires Hammer.js v2
		if (typeof (window.Hammer) !== "undefined") {
			// Disable warning that we call `Hammer()`, not `new Hammer()`
			//jshint newcap:false
			var hammertime = window.Hammer(this.domElement, {
				transform_always_block : true,
				transform_min_scale : 1
			});

			hammertime.on('touch drag transform release', function (ev) {
				switch (ev.type) {
					case 'transform':
						var scale = ev.gesture.scale;
						if (scale < 1) {
							that.applyWheel(that.zoomSpeed * 1);
						} else if (scale > 1) {
							that.applyWheel(that.zoomSpeed * -1);
						}
						break;
					case 'touch':
						that.updateButtonState(0, true);
						break;
					case 'release':
						that.updateButtonState(0, false);
						break;
					case 'drag':
						that.updateDeltas(ev.gesture.center.pageX, ev.gesture.center.pageY);
						break;
				}
			});
		}
	};

	OrbitNPanControlScript.prototype.updateButtonState = function(buttonIndex, down) {
		if (buttonIndex === 2 || buttonIndex === 0 && this.altKey) {
			OrbitCamControlScript.prototype.updateButtonState.call(this, 0, down);
		} else if (buttonIndex === 1 || buttonIndex === 0 && this.shiftKey) {
			this.panState.buttonDown = down;
			if(down) {
				this.panState.lastX = NaN;
				this.panState.lastY = NaN;
				this.panState.lastPos.setv(this.lookAtPoint);
			}
		}
	};

	OrbitNPanControlScript.prototype.resetLookAt = function(lookat, x, y, z) {
		this.goingToLookAt.setv(lookat);
		this.lookAtPoint.setv(lookat);
		this.panState.lastX = NaN;
		this.panState.lastY = NaN;
		this.panState.lastPos.setv(lookat);
		this.velocity.set(0);

		MathUtils.cartesianToSpherical(x, y, z, this.spherical);
		this.targetSpherical.setv(this.spherical);
		MathUtils.sphericalToCartesian(this.spherical.x, this.spherical.y, this.spherical.z, this.cartesian);
	};

	OrbitNPanControlScript.prototype.updateDeltas = function(mouseX, mouseY) {
		OrbitCamControlScript.prototype.updateDeltas.call(this, mouseX, mouseY);
		var v = new Vector3();
		var u = new Vector3();

		if (isNaN(this.panState.lastX) || isNaN(this.panState.lastY)) {
			this.panState.lastX = mouseX;
			this.panState.lastY = mouseY;
		}
		if(this.panState.buttonDown) {
			var c = Renderer.mainCamera;


			c.getScreenCoordinates(this.panState.lastPos, 1, 1, u);
			u.x -= (mouseX - this.panState.lastX) / this.viewportWidth;
			u.y += (mouseY - this.panState.lastY) / this.viewportHeight;
			c.getWorldCoordinates(
				u.x,
				u.y,
				1,
				1,
				u.z,
				v
			);
			this.lookAtPoint.setv(v);
			this.goingToLookAt.setv(this.lookAtPoint);
			this.dirty = true;
		}
	};

	OrbitNPanControlScript.prototype.applyWheel = function (delta) {
		var delta = (this.invertedWheel ? -1 : 1) * MathUtils.clamp(delta, -1, 1);

		// Decrease zoom if shift is pressed
		if (this.shiftKey) {
			delta *= this.detailZoom;
		}
		delta *= this.zoomDistanceFactor * this.targetSpherical.x;


		this.zoom(this.zoomSpeed * delta);
	};

	OrbitNPanControlScript.prototype.run = function(entity, tpf, env) {
		if(!this.goingToLookAt.equals(this.lookAtPoint)) {
			var delta = tpf * 7;
			this.lookAtPoint.lerp(this.goingToLookAt, delta);
			this.dirty = true;
		}
		OrbitCamControlScript.prototype.run.call(this, entity, tpf, env);
		if (env) {
			this.viewportWidth = env.viewportWidth;
			this.viewportHeight = env.viewportHeight;
		}
	};

	return OrbitNPanControlScript;
});