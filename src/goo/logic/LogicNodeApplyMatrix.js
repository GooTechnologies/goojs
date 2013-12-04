define(
	[
		'goo/logic/LogicLayer',
		'goo/logic/LogicNode',
		'goo/logic/LogicNodes',
		'goo/logic/LogicInterface',
		'goo/math/Vector3',
		'goo/math/Matrix3x3'
	],
	/** @lends */
	function(LogicLayer, LogicNode, LogicNodes, LogicInterface, Vector3, Matrix3x3) {
		"use strict";

		/**
		 * @class Logic node that calculates sine
		 */
		function LogicNodeApplyMatrix() {
			LogicNode.call(this);
			this.logicInterface = LogicNodeApplyMatrix.logicInterface;
			this.type = "LogicNodeApplyMatrix";
			this.vec = new Vector3();
		}

		LogicNodeApplyMatrix.prototype = Object.create(LogicNode.prototype);
		LogicNodeApplyMatrix.editorName = "ApplyMatrix";

		LogicNodeApplyMatrix.prototype.onInputChanged = function(instDesc, portID, value) {
			var vec = LogicLayer.readPort(this.logicInstance, LogicNodeApplyMatrix.inportX);
			var mat = LogicLayer.readPort(this.logicInstance, LogicNodeApplyMatrix.inportY);
			this.vec.copy(vec);
			mat.applyPost(this.vec);
			LogicLayer.writeValue(this.logicInstance, LogicNodeApplyMatrix.outportProduct, this.vec);
		};

		LogicNodeApplyMatrix.logicInterface = new LogicInterface();
		LogicNodeApplyMatrix.outportProduct = LogicNodeApplyMatrix.logicInterface.addOutputProperty("product", "Vector3");
		LogicNodeApplyMatrix.inportX = LogicNodeApplyMatrix.logicInterface.addInputProperty("vec", "Vector3", new Vector3());
		LogicNodeApplyMatrix.inportY = LogicNodeApplyMatrix.logicInterface.addInputProperty("mat", "Matrix3", new Matrix3x3());

		LogicNodes.registerType("LogicNodeApplyMatrix", LogicNodeApplyMatrix);
		
		

		return LogicNodeApplyMatrix;
	});