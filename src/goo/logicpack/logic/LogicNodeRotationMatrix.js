define(
	[
		'goo/logic/LogicLayer',
		'goo/logic/LogicNode',
		'goo/logic/LogicNodes',
		'goo/logic/LogicInterface',
		'goo/math/Vector3',
		'goo/math/Matrix3x3'
	],

	function(LogicLayer, LogicNode, LogicNodes, LogicInterface, Vector3, Matrix3x3) {
		'use strict';

		/**
		 * Logic node that constructs a rotation matrix.
		 * @private
		 */
		function LogicNodeRotationMatrix() {
			LogicNode.call(this);
			this.logicInterface = LogicNodeRotationMatrix.logicInterface;
			this.type = "LogicNodeRotationMatrix";
			this.vec = new Vector3();
		}

		LogicNodeRotationMatrix.prototype = Object.create(LogicNode.prototype);
		LogicNodeRotationMatrix.editorName = "RotationMatrix";

		LogicNodeRotationMatrix.prototype.onInputChanged = function(instDesc) {
			var vec = LogicLayer.readPort(instDesc, LogicNodeRotationMatrix.inportX);
			var mat = new Matrix3x3();
			mat.fromAngles(vec.x, vec.y, vec.z);
			LogicLayer.writeValue(instDesc, LogicNodeRotationMatrix.outportProduct, mat);
		};

		LogicNodeRotationMatrix.logicInterface = new LogicInterface();
		LogicNodeRotationMatrix.inportX = LogicNodeRotationMatrix.logicInterface.addInputProperty("vec", "Vector3", new Vector3());
		LogicNodeRotationMatrix.outportProduct = LogicNodeRotationMatrix.logicInterface.addOutputProperty("mat", "Matrix3", new Matrix3x3());

		LogicNodes.registerType("LogicNodeRotationMatrix", LogicNodeRotationMatrix);



		return LogicNodeRotationMatrix;
	});