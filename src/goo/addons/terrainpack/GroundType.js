define([

],
	/** @lends */
		function(

		) {
		'use strict';

		var GroundType = function(id, texturePath, effectsMaterial) {
			this.id = id;
			this.texture = texturePath;
			this.material = effectsMaterial;
		};

		GroundType.prototype.addVegetationType = function(type, probability) {
			if (!this.vegetation) this.vegetation = {};
			this.vegetation[type] = probability;
		};

		GroundType.prototype.addForestType = function(type, probability) {
			if (!this.forest) this.forest = {};
			this.forest[type] = probability;
		};

		GroundType.prototype.addWaterPlantType = function(type, probability) {
			if (!this.waterPlants) this.waterPlants = {};
			this.waterPlants[type] = probability;
		};

		return GroundType;
	}
);