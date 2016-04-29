var RenderSystem = require('./RenderSystem');
var Camera = require('../../renderer/Camera');
var Vector3 = require('../../math/Vector3');

/* global VRDisplay, HMDVRDevice */

/**
 * Renders entities/renderables using a configurable partitioner for culling
 * @property {boolean} doRender Only render if set to true
 * @param {Renderer} renderer Renderer
 * @extends RenderSystem
 */
function VRRenderSystem(renderer) {
	RenderSystem.apply(this, arguments);

	var renderer = this.renderer = renderer;

	var that = this;

	this.vrHMD = undefined;
	this.isDeprecatedAPI = false;
	this.eyeTranslationL = new Vector3();
	this.eyeTranslationR = new Vector3();

	function gotVRDevices(devices) {
		for (var i = 0; i < devices.length; i++) {
			if ('VRDisplay' in window && devices[i] instanceof VRDisplay) {
				that.vrHMD = devices[i];
				that.isDeprecatedAPI = false;
				break; // We keep the first we encounter
			} else if ('HMDVRDevice' in window && devices[i] instanceof HMDVRDevice) {
				that.vrHMD = devices[i];
				that.isDeprecatedAPI = true;
				break; // We keep the first we encounter
			}
		}

		if (that.vrHMD === undefined) {
			console.error('HMD input not available.');
		} else {
			console.log('HMD input available: ' + that.vrHMD);
		}
	}

	if (navigator.getVRDisplays) {
		navigator.getVRDisplays().then(gotVRDevices);
	} else if (navigator.getVRDevices) {
		// Deprecated API.
		navigator.getVRDevices().then(gotVRDevices);
	}

	this.isPresenting = false;
	this.scale = 1;

	var rendererSize = renderer.getSize();
	var rendererPixelRatio = renderer.getPixelRatio();

	this.setSize = function(width, height) {
		rendererSize = { width: width, height: height };

		if (that.isPresenting) {
			var eyeParamsL = that.vrHMD.getEyeParameters('left');
			renderer.setPixelRatio(1);

			if (that.isDeprecatedAPI) {
				renderer.setSize(eyeParamsL.renderRect.width * 2, eyeParamsL.renderRect.height, false);
			} else {
				renderer.setSize(eyeParamsL.renderWidth * 2, eyeParamsL.renderHeight, false);
			}
		} else {
			renderer.setPixelRatio(rendererPixelRatio);
			renderer.setSize(width, height);
		}
	};

	// fullscreen
	var canvas = renderer.domElement;
	var fullscreenchange = canvas.mozRequestFullScreen ? 'mozfullscreenchange' : 'webkitfullscreenchange';

	document.addEventListener(fullscreenchange, function() {
		that.isPresenting = that.isDeprecatedAPI && that.vrHMD && (document.mozFullScreenElement || document.webkitFullscreenElement) !== undefined;

		if (that.isPresenting) {
			rendererPixelRatio = renderer.getPixelRatio();
			rendererSize = renderer.getSize();

			var eyeParamsL = that.vrHMD.getEyeParameters('left');
			renderer.setPixelRatio(1);
			renderer.setSize(eyeParamsL.renderRect.width * 2, eyeParamsL.renderRect.height, false);
		} else {
			renderer.setPixelRatio(rendererPixelRatio);
			renderer.setSize(rendererSize.width, rendererSize.height);
		}
	}, false);

	window.addEventListener('vrdisplaypresentchange', function() {
		that.isPresenting = that.vrHMD && that.vrHMD.isPresenting;

		if (that.isPresenting) {
			rendererPixelRatio = renderer.getPixelRatio();
			rendererSize = renderer.getSize();

			var eyeParamsL = that.vrHMD.getEyeParameters('left');
			renderer.setPixelRatio(1);
			renderer.setSize(eyeParamsL.renderWidth * 2, eyeParamsL.renderHeight, false);
		} else {
			renderer.setPixelRatio(rendererPixelRatio);
			renderer.setSize(rendererSize.width, rendererSize.height);
		}
	}, false);

	this.setFullScreen = function(boolean) {
		return new Promise(function(resolve, reject) {
			if (that.vrHMD === undefined) {
				reject(new Error('No VR hardware found.'));
				return;
			}
			if (that.isPresenting === boolean) {
				resolve();
				return;
			}

			if (!that.isDeprecatedAPI) {
				if (boolean) {
					resolve(that.vrHMD.requestPresent([{ source: canvas }]));
				} else {
					resolve(that.vrHMD.exitPresent());
				}
			} else {
				if (canvas.mozRequestFullScreen) {
					canvas.mozRequestFullScreen({ vrDisplay: that.vrHMD });
					resolve();
				} else if (canvas.webkitRequestFullscreen) {
					canvas.webkitRequestFullscreen({ vrDisplay: that.vrHMD });
					resolve();
				} else {
					console.error('No compatible requestFullscreen method found.');
					reject(new Error('No compatible requestFullscreen method found.'));
				}
			}
		});
	};

	this.requestPresent = function() {
		return this.setFullScreen(true);
	};

	this.exitPresent = function() {
		return this.setFullScreen(false);
	};

	var leftVec = new Vector3(-1, 0, 0);
	var upVec = new Vector3(0, 1, 0);
	var dirVec = new Vector3(0, 0, -1);
	this.updateCamera = function(transform) {
		this.camera._left.set(leftVec);
		this.camera._left.applyPost(transform.rotation);
		this.camera._up.set(upVec);
		this.camera._up.applyPost(transform.rotation);
		this.camera._direction.set(dirVec);
		this.camera._direction.applyPost(transform.rotation);
		transform.matrix.getTranslation(this.camera.translation);
		this.camera.onFrameChange();
	};

	// render
	this.cameraL = new Camera();
	//this.cameraL.layers.enable(1);

	this.cameraR = new Camera();
	//this.cameraR.layers.enable(2);
}

VRRenderSystem.prototype = Object.create(RenderSystem.prototype);
VRRenderSystem.prototype.constructor = VRRenderSystem;

VRRenderSystem.prototype.render = function(renderer) {
	if (!this.doRender || !this.camera) {
		return;
	}

	var eyeFOVL, eyeFOVR;

	if (this.vrHMD && this.isPresenting) {
		var eyeParamsL = this.vrHMD.getEyeParameters('left');
		var eyeParamsR = this.vrHMD.getEyeParameters('right');

		if (!this.isDeprecatedAPI) {
			this.eyeTranslationL.setArray(eyeParamsL.offset);
			this.eyeTranslationR.setArray(eyeParamsR.offset);
			eyeFOVL = eyeParamsL.fieldOfView;
			eyeFOVR = eyeParamsR.fieldOfView;
		} else {
			this.eyeTranslationL.setDirect(eyeParamsL.eyeTranslation.x, eyeParamsL.eyeTranslation.y, eyeParamsL.eyeTranslation.z);
			this.eyeTranslationR.setDirect(eyeParamsR.eyeTranslation.x, eyeParamsR.eyeTranslation.y, eyeParamsR.eyeTranslation.z);
			eyeFOVL = eyeParamsL.recommendedFieldOfView;
			eyeFOVR = eyeParamsR.recommendedFieldOfView;
		}
		/*
				if (Array.isArray(scene)) {
					console.warn('THREE.VREffect.render() no longer supports arrays. Use object.layers instead.');
					scene = scene[0];
				}
		*/
		// When rendering we don't care what the recommended size is, only what the actual size
		// of the backbuffer is.
		var size = renderer.getSize();
		var renderRectL = { x: 0, y: 0, width: size.width / 2, height: size.height };
		var renderRectR = { x: size.width / 2, y: 0, width: size.width / 2, height: size.height };

		//renderer.setScissorTest(true);
		renderer.context.enable(renderer.context.SCISSOR_TEST);
		renderer.clear();

		//if (camera.parent === null) camera.updateMatrixWorld();

		this.cameraL.projection = fovToProjection(eyeFOVL, true, this.camera.near, this.camera.far);
		this.cameraR.projection = fovToProjection(eyeFOVR, true, this.camera.near, this.camera.far);

		this.camera.matrixWorld.decompose(this.cameraL.position, this.cameraL.quaternion, this.cameraL.scale);
		this.camera.matrixWorld.decompose(this.cameraR.position, this.cameraR.quaternion, this.cameraR.scale);

		this.cameraL.translateOnAxis(this.eyeTranslationL, this.scale);
		this.cameraR.translateOnAxis(this.eyeTranslationR, this.scale);

		// render left eye
		renderer.setViewport(renderRectL.x, renderRectL.y, renderRectL.width, renderRectL.height);
		//renderer.setScissor(renderRectL.x, renderRectL.y, renderRectL.width, renderRectL.height);
		renderer.context.scissor(renderRectL.x, renderRectL.y, renderRectL.width, renderRectL.height);
		this.renderFromCam(renderer, this.cameraL);

		// render right eye
		renderer.setViewport(renderRectR.x, renderRectR.y, renderRectR.width, renderRectR.height);
		//renderer.setScissor(renderRectR.x, renderRectR.y, renderRectR.width, renderRectR.height);
		renderer.context.scissor(renderRectR.x, renderRectR.y, renderRectR.width, renderRectR.height);
		this.renderFromCam(renderer, this.cameraR);

		//renderer.setScissorTest(false);
		renderer.context.disable(renderer.context.SCISSOR_TEST);

		if (!this.isDeprecatedAPI) {
			this.vrHMD.submitFrame();
		}

		return;
	}

	// Regular render mode if not HMD
	this.renderFromCam(renderer, this.camera);
};

VRRenderSystem.prototype.renderFromCam = function(renderer, camera) {
	renderer.updateShadows(this.partitioner, this.entities, this.lights);

	for (var i = 0; i < this.preRenderers.length; i++) {
		var preRenderer = this.preRenderers[i];
		preRenderer.process(renderer, this.entities, this.partitioner, camera, this.lights);
	}

	if (this.partitioningCamera) {
		this.partitioner.process(this.partitioningCamera, this.entities, this.renderList);
	} else {
		this.partitioner.process(camera, this.entities, this.renderList);
	}

	if (this.composers.length > 0 && this._composersActive) {
		for (var i = 0; i < this.composers.length; i++) {
			var composer = this.composers[i];
			composer.render(renderer, this.currentTpf, camera, this.lights, null, true, this.overrideMaterials);
		}
	} else {
		renderer.render(this.renderList, camera, this.lights, null, true, this.overrideMaterials);
	}
}

function fovToNDCScaleOffset(fov) {
	var pxscale = 2.0 / (fov.leftTan + fov.rightTan);
	var pxoffset = (fov.leftTan - fov.rightTan) * pxscale * 0.5;
	var pyscale = 2.0 / (fov.upTan + fov.downTan);
	var pyoffset = (fov.upTan - fov.downTan) * pyscale * 0.5;
	return { scale: [pxscale, pyscale], offset: [pxoffset, pyoffset] };
}

function fovPortToProjection(fov, rightHanded, zNear, zFar) {
	rightHanded = rightHanded === undefined ? true : rightHanded;
	zNear = zNear === undefined ? 0.01 : zNear;
	zFar = zFar === undefined ? 10000.0 : zFar;

	var handednessScale = rightHanded ? -1.0 : 1.0;

	// start with an identity matrix
	var mobj = new Matrix4();
	var m = mobj.data;

	// and with scale/offset info for normalized device coords
	var scaleAndOffset = fovToNDCScaleOffset(fov);

	// X result, map clip edges to [-w,+w]
	m[0 * 4 + 0] = scaleAndOffset.scale[0];
	m[0 * 4 + 1] = 0.0;
	m[0 * 4 + 2] = scaleAndOffset.offset[0] * handednessScale;
	m[0 * 4 + 3] = 0.0;

	// Y result, map clip edges to [-w,+w]
	// Y offset is negated because this proj matrix transforms from world coords with Y=up,
	// but the NDC scaling has Y=down (thanks D3D?)
	m[1 * 4 + 0] = 0.0;
	m[1 * 4 + 1] = scaleAndOffset.scale[1];
	m[1 * 4 + 2] = -scaleAndOffset.offset[1] * handednessScale;
	m[1 * 4 + 3] = 0.0;

	// Z result (up to the app)
	m[2 * 4 + 0] = 0.0;
	m[2 * 4 + 1] = 0.0;
	m[2 * 4 + 2] = zFar / (zNear - zFar) * -handednessScale;
	m[2 * 4 + 3] = (zFar * zNear) / (zNear - zFar);

	// W result (= Z in)
	m[3 * 4 + 0] = 0.0;
	m[3 * 4 + 1] = 0.0;
	m[3 * 4 + 2] = handednessScale;
	m[3 * 4 + 3] = 0.0;

	mobj.transpose();

	return mobj;
}

function fovToProjection(fov, rightHanded, zNear, zFar) {
	var DEG2RAD = Math.PI / 180.0;

	var fovPort = {
		upTan: Math.tan(fov.upDegrees * DEG2RAD),
		downTan: Math.tan(fov.downDegrees * DEG2RAD),
		leftTan: Math.tan(fov.leftDegrees * DEG2RAD),
		rightTan: Math.tan(fov.rightDegrees * DEG2RAD)
	};

	return fovPortToProjection(fovPort, rightHanded, zNear, zFar);
}

module.exports = VRRenderSystem;
