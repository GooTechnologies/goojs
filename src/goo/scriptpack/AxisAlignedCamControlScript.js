var Vector3 = require('../math/Vector3');
var MathUtils = require('../math/MathUtils');

/**
 * Axis aligned camera control script
 * @returns {{setup: setup, update: update, cleanup: cleanup}}
 */
function AxisAlignedCamControlScript() {
	function setup(params, env) {
		// Look axis
		env.axis = Vector3.UNIT_Z.clone();
		// Up axis will most often be Y but you never know...
		env.upAxis = Vector3.UNIT_Y.clone();
		setView(params, env, params.view);
		env.currentView = params.view;
		env.lookAtPoint	= new Vector3();
		env.distance	= params.distance;
		env.smoothness	= Math.pow(MathUtils.clamp(params.smoothness, 0, 1), 0.3);
		env.axisAlignedDirty = true;
	}

	function setView(params, env, view) {
		if (env.currentView === view) {
			return;
		}
		env.currentView = view;
		switch (view) {
			case 'XY':
				env.axis.set(Vector3.UNIT_Z);
				env.upAxis.set(Vector3.UNIT_Y);
				break;
			case 'ZY':
				env.axis.set(Vector3.UNIT_X);
				env.upAxis.set(Vector3.UNIT_Y);
				break;
		}
		env.axisAlignedDirty = true;
	}

	function update(params, env) {
		if (params.view !== env.currentView) {
			env.axisAlignedDirty = true;
		}
		if (!env.axisAlignedDirty) {
			return;
		}
		var entity = env.entity;
		var transform = entity.transformComponent.transform;
		transform.translation.set(env.axis).scale(env.distance).add(env.lookAtPoint);
		// REVIEW: Collision with pancamscript? Make new panscript for the 2d camera, or bake the panning logic into the axisaligned camera script?
		transform.lookAt(env.lookAtPoint, env.upAxis);
		entity.transformComponent.setUpdated();

		env.axisAlignedDirty = false;
	}

	// Removes all listeners
	function cleanup(/*params, env*/) {
	}

	return {
		setup: setup,
		update: update,
		cleanup: cleanup
	};
}

AxisAlignedCamControlScript.externals = {
	key: 'AxisAlignedCamControlScript',
	name: 'Axis-aligned Camera Control',
	description: 'Aligns a camera along an axis, and enables switching between them.',
	parameters: [{
		key: 'whenUsed',
		name: 'When Camera Used',
		description: 'Script only runs when the camera to which it is added is being used.',
		'default': true,
		type: 'boolean'
	}, {
		key: 'distance',
		name: 'Distance',
		type: 'float',
		description: 'Camera distance from lookat point',
		control: 'slider',
		'default': 1,
		min: 1,
		max: 1e3
	}, {
		key: 'view',
		type: 'string',
		'default': 'XY',
		control: 'select',
		options: ['XY', 'ZY']
	}]
};

module.exports = AxisAlignedCamControlScript;