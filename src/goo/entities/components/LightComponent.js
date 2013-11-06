define(['goo/entities/components/Component', 'goo/logic/LogicInterface'],
	/** @lends */
	function (Component, LogicInterface) {
	"use strict";

	/**
	 * @class Defines a light
	 * @param {Light} light Light to contain in this component (directional, spot, point)
	 */
	function LightComponent(light) {
		this.type = 'LightComponent';

		this.light = light;
		this.logicInstance = null;
		
		Component.call(this);
	}

	LightComponent.prototype = Object.create(Component.prototype);

	LightComponent.prototype.updateLight = function (transform) {
		this.light.update(transform);
	};

	// Logic interface set-up	
	LightComponent.logicInterface = new LogicInterface();
	LightComponent.inportIntensity = LightComponent.logicInterface.addInputProperty("Intensity", "float");
	LightComponent.inportRange = LightComponent.logicInterface.addInputProperty("Range", "float");
	
	LightComponent.prototype.insertIntoLogicLayer = function(logicLayer) {
		this.logicInstance = logicLayer.addInterfaceInstance(LightComponent.logicInterface, this);
	}
	
	LightComponent.prototype.onPropertyWrite = function(propID, value) {
		if (propID == LightComponent.inportIntensity)
			this.light.intensity = value;
	}

	return LightComponent;
});