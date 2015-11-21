define(
	[var LogicLayer = require('goo/logic/LogicLayer');
var LogicNode = require('goo/logic/LogicNode');
var LogicNodes = require('goo/logic/LogicNodes');
var LogicInterface = require('goo/logic/LogicInterface');
var Vector3 = require('goo/math/Vector3');
var Matrix3 = require('goo/math/Matrix3');
	],

	function (LogicLayer, LogicNode, LogicNodes, LogicInterface, Vector3, Matrix3) {
		'use strict';

		/**
		 * Logic node that constructs a rotation matrix.
		 * @private
		 */
		function LogicNodeRotationMatrix() {
			LogicNode.call(this);
			this.logicInterface = LogicNodeRotationMatrix.logicInterface;
			this.type = 'LogicNodeRotationMatrix';
			this.vec = new Vector3();
		}

		LogicNodeRotationMatrix.prototype = Object.create(LogicNode.prototype);
		LogicNodeRotationMatrix.editorName = 'RotationMatrix';

		LogicNodeRotationMatrix.prototype.onInputChanged = function (instDesc) {
			var vec = LogicLayer.readPort(instDesc, LogicNodeRotationMatrix.inportX);
			var mat = new Matrix3();
			mat.fromAngles(vec.x, vec.y, vec.z);
			LogicLayer.writeValue(instDesc, LogicNodeRotationMatrix.outportProduct, mat);
		};

		LogicNodeRotationMatrix.logicInterface = new LogicInterface();
		LogicNodeRotationMatrix.inportX = LogicNodeRotationMatrix.logicInterface.addInputProperty('vec', 'Vector3', new Vector3());
		LogicNodeRotationMatrix.outportProduct = LogicNodeRotationMatrix.logicInterface.addOutputProperty('mat', 'Matrix3', new Matrix3());

		LogicNodes.registerType('LogicNodeRotationMatrix', LogicNodeRotationMatrix);



		return LogicNodeRotationMatrix;
	});