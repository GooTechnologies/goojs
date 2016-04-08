var Action = require('../../../fsmpack/statemachine/actions/Action');
var Matrix3 = require('../../../math/Matrix3');
var Quaternion = require('../../../math/Quaternion');
var MathUtils = require('../../../math/MathUtils');

function SetRigidBodyRotationAction(/*id, settings*/) {
	Action.apply(this, arguments);
}

SetRigidBodyRotationAction.prototype = Object.create(Action.prototype);
SetRigidBodyRotationAction.prototype.constructor = SetRigidBodyRotationAction;

SetRigidBodyRotationAction.external = {
	key: 'setRigidBodyRotation',
	name: 'Set Rigid Body Rotation',
	type: 'physics',
	canTransition: false,
	parameters: [{
		name: 'Rotation',
		key: 'rotation',
		type: 'vec3',
		description: 'Absolute rotation to set.',
		'default': [0, 0, 0]
	},{
		name: 'Relative',
		key: 'relative',
		type: 'boolean',
		description: 'Relative to the current rotation or absolute.',
		'default': false
	}],
	transitions: []
};

SetRigidBodyRotationAction.prototype.setRotation = (function () {
	var matrix = new Matrix3();
	var matrix2 = new Matrix3();
	var quaternion = new Quaternion();
	var quaternion2 = new Quaternion();
	var DEG_TO_RAD = MathUtils.DEG_TO_RAD;
	return function (fsm) {
		var entity = fsm.getOwnerEntity();
		if (entity && entity.rigidBodyComponent) {
			var rotation = this.rotation;
			matrix.fromAngles(
				rotation[0] * DEG_TO_RAD,
				rotation[1] * DEG_TO_RAD,
				rotation[2] * DEG_TO_RAD
			);

			if (this.relative) {
				entity.rigidBodyComponent.getQuaternion(quaternion2);
				matrix2.copyQuaternion(quaternion2);
				matrix.mul2(matrix2, matrix);
			}

			quaternion.fromRotationMatrix(matrix);
			entity.rigidBodyComponent.setQuaternion(quaternion);
		}
	};
})();

SetRigidBodyRotationAction.prototype.enter = function (fsm) {
	this.setRotation(fsm);
};

module.exports = SetRigidBodyRotationAction;