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
			this.vegetation = {};
			this.forest = {};
			this.waterPlants = {};
		};

		GroundType.prototype.addVegetationType = function(type, probability) {
			this.vegetation[type] = probability;
		};

		GroundType.prototype.addForestType = function(type, probability) {
			this.forest[type] = probability;
		};

		GroundType.prototype.addWaterPlantType = function(type, probability) {
			this.waterPlants[type] = probability;
		};

		return GroundType;
	}
);