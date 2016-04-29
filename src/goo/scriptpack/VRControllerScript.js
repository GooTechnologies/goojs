var Matrix4 = require('../math/Matrix4');
var Quaternion = require('../math/Quaternion');

/* global VRDisplay, PositionSensorVRDevice */

var setup = function(args, ctx) {
	ctx.vrInput = null;
	ctx.standingMatrix = new Matrix4();
	ctx.quaternion = new Quaternion();

	function gotVRDevices(devices) {
		for (var i = 0; i < devices.length; i++) {
			if (('VRDisplay' in window && devices[i] instanceof VRDisplay) ||
				('PositionSensorVRDevice' in window && devices[i] instanceof PositionSensorVRDevice)) {
				ctx.vrInput = devices[i];
				break; // We keep the first we encounter
			}
		}

		if (!ctx.vrInput) {
			console.error('VR input not available.');
		}
	}

	if (navigator.getVRDisplays) {
		navigator.getVRDisplays().then(gotVRDevices);
	} else if (navigator.getVRDevices) {
		// Deprecated API.
		navigator.getVRDevices().then(gotVRDevices);
	}

	ctx.resetPose = function() {
		if (ctx.vrInput) {
			if (ctx.vrInput.resetPose !== undefined) {
				ctx.vrInput.resetPose();
			} else if (ctx.vrInput.resetSensor !== undefined) {
				// Deprecated API.
				ctx.vrInput.resetSensor();
			} else if (ctx.vrInput.zeroSensor !== undefined) {
				// Really deprecated API.
				ctx.vrInput.zeroSensor();
			}
		}
	};
};

var update = function(args, ctx) {
	var vrInput = ctx.vrInput;
	if (vrInput) {
		var object = ctx.entity.transformComponent.transform;
		
		if (vrInput.getPose) {
			var pose = vrInput.getPose();

			if (pose.orientation !== null) {
				ctx.quaternion.setArray(pose.orientation);
				object.rotation.copyQuaternion(ctx.quaternion);
			}

			if (pose.position !== null) {
				object.translation.setArray(pose.position);
			} else {
				object.translation.setDirect(0, 0, 0);
			}
		} else {
			// Deprecated API.
			var state = vrInput.getState();

			if (state.orientation !== null) {
				ctx.quaternion.setDirect(state.orientation.x, state.orientation.y, state.orientation.z, state.orientation.w);
				object.rotation.copyQuaternion(ctx.quaternion);
			}

			if (state.position !== null) {
				object.translation.setDirect(state.position.x, state.position.y, state.position.z);
			} else {
				object.translation.setDirect(0, 0, 0);
			}
		}

		if (args.standingSpace) {
			if (vrInput.stageParameters) {
				//object.updateMatrix();
				object.update();

				ctx.standingMatrix.setArray(vrInput.stageParameters.sittingToStandingTransform);
				//object.applyMatrix(ctx.standingMatrix);
				object.matrix.mul(ctx.standingMatrix);
			} else {
				object.translation.y = object.translation.y + args.userHeight;
			}
		}

		object.translation.scale(args.worldScale);
		
		ctx.entity.transformComponent.setUpdated();
	}
};

var cleanup = function(args, ctx) {
	ctx.vrInput = null;
};

function VRControllerScript() {
	return {
		setup: setup,
		update: update,
		cleanup: cleanup
	};
}

VRControllerScript.externals = {
	key: 'VRControllerScript',
	name: 'VR Controller',
	description: 'VR Controller',
	parameters: [
		{ key: 'worldScale', type: 'float', default: 1, 
			description: 'The Rift SDK returns the position in meters. This scale factor allows the user to define how meters are converted to scene units.' },
		{ key: 'standingSpace', type: 'boolean', default: false,
			description: 'If true will use "standing space" coordinate system where y=0 is the floor and x=0, z=0 is the center of the room.' },
		{ key: 'userHeight', type: 'float', default: 1.7,
			description: 'Distance from the users eyes to the floor in meters. Used when standing=true but the VRDisplay doesn\'t provide stageParameters.' }
	]
};

module.exports = VRControllerScript;