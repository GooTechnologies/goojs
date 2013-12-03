define(
	[
		'goo/logic/LogicLayer',
		'goo/logic/LogicNode',
		'goo/logic/LogicNodes',
		'goo/logic/LogicInterface',
		'goo/entities/components/LightComponent',
		'goo/math/Vector3',
		'goo/math/Matrix3x3'
	],
	/** @lends */
	function(LogicLayer, LogicNode, LogicNodes, LogicInterface, LightComponent, Vector3, Matrix3x3) {
		"use strict";

		/**
		 * @class Logic nnode that calculates sine
		 */
		function LogicNodeLightComponent() {
			LogicNode.call(this);
			this.logicInterface = LogicNodeLightComponent.logicInterface;
			this.type = "LightComponent";
		}

		LogicNodeLightComponent.prototype = Object.create(LogicNode.prototype);
		LogicNodeLightComponent.editorName = "LightComponent";

		LogicNodeLightComponent.prototype.insertIntoLogicLayer = function(logicLayer, interfaceName) {
			this.logicInstance = logicLayer.addInterfaceInstance(LogicNodeLightComponent.logicInterface, this, interfaceName, false);
		};
		
		LogicNodeLightComponent.prototype.onConfigure = function(config) {
			this.entityRef = config.config.entityRef;
		};

		// Logic interface set-up	
		LightNodeLightComponent.logicInterface = new LogicInterface("LightComponent");
		LightNodeLightComponent.inportIntensity = LightNodeLightComponent.logicInterface.addInputProperty("Intensity", "float");
		LightNodeLightComponent.inportRange = LightNodeLightComponent.logicInterface.addInputProperty("Range", "float");

		LightNodeLightComponent.prototype.insertIntoLogicLayer = function(logicLayer, interfaceName) {
			this.logicInstance = logicLayer.addInterfaceInstance(LightNodeLightComponent.logicInterface, this, interfaceName, false);
		};

		LightNodeLightComponent.prototype.onInputChanged = function(instDesc, propID, value) {
			var entity = LogicLayer.resolveEntityRef(instDesc, this.entityRef);
			if (propID === LightNodeLightComponent.inportIntensity) {
				entity.lightComponent.light.intensity = value;
			} else if (propID === LightNodeLightComponent.inportRange) {
				entity.lightComponent.light.range = value;
			}
		};

		LogicNodeLightNodeLightComponent.logicInterface.addConfigEntry({name: 'entityRef', type: 'entityRef', label: 'Entity'});
		LogicNodes.registerType("LightComponent", LogicNodeLightComponent);
		return LogicNodeLightComponent;
	});