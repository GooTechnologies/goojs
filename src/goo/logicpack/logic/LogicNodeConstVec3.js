define(
	[
		'goo/logic/LogicLayer',
		'goo/logic/LogicNode',
		'goo/logic/LogicNodes',
		'goo/logic/LogicInterface',
		'goo/math/Vector3'
	],

	function(LogicLayer, LogicNode, LogicNodes, LogicInterface, Vector3) {
		'use strict';

		/**
		 * @class Logic node to provide a const Vec3
		 * @private
		 */
		function LogicNodeConstVec3() {
			LogicNode.call(this);
			this.logicInterface = LogicNodeConstVec3.logicInterface;
			this.type = "LogicNodeConstVec3";
		}

		LogicNodeConstVec3.prototype = Object.create(LogicNode.prototype);
		LogicNodeConstVec3.editorName = "ConstVec3";

		LogicNodeConstVec3.prototype.onConfigure = function(newConfig) {
			if (newConfig.value !== undefined) {
				this.value = newConfig.value;
				LogicLayer.writeValue(this.logicInstance, LogicNodeConstVec3.outportVec, new Vector3(this.x, this.y, this.z));
			}
		};

		LogicNodeConstVec3.prototype.onSystemStarted = function() {
			LogicLayer.writeValue(this.logicInstance, LogicNodeConstVec3.outportVec, new Vector3(this.x, this.y, this.z));
		};

		LogicNodes.registerType("LogicNodeConstVec3", LogicNodeConstVec3);

		LogicNodeConstVec3.logicInterface = new LogicInterface();
		LogicNodeConstVec3.outportVec = LogicNodeConstVec3.logicInterface.addOutputProperty("xyz", "Vector3");

		LogicNodeConstVec3.logicInterface.addConfigEntry({
			name: 'x',
			type: 'float',
			label: 'X'
		});

		LogicNodeConstVec3.logicInterface.addConfigEntry({
			name: 'y',
			type: 'float',
			label: 'Y'
		});

		LogicNodeConstVec3.logicInterface.addConfigEntry({
			name: 'z',
			type: 'float',
			label: 'Z'
		});

		return LogicNodeConstVec3;
	}
);