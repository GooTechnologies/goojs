define([
	'goo/entities/systems/System',
	'goo/entities/SystemBus',
	'goo/renderer/Renderer',
	'goo/logic/LogicLayer'
],
	/** @lends */
function (
	System,
	SystemBus,
	Renderer,
	LogicLayer
) {
	"use strict";

	/**
	 * @class Updates cameras/cameracomponents with ther transform component transforms
	 */
	function LogicSystem() {
		System.call(this, 'LogicSystem', null);

		this.passive = true;
		this.logicLayer = new LogicLayer();
	}

	LogicSystem.prototype = Object.create(System.prototype);

	LogicSystem.prototype.inserted = function (entity) {
		var logicLayer = this.logicLayer;
		var counter = 0;
		entity.forEachComponent(function(comp, index) {
			if (comp.insertIntoLogicLayer !== undefined) {
				comp.insertIntoLogicLayer(logicLayer, entity.name + "~" + (counter++));
			}
		});
	};

	LogicSystem.prototype.deleted = function (entity) {
	};

	LogicSystem.prototype.process = function (entities, tpf) {
		this.logicLayer.process(tpf);
	};

	LogicSystem.prototype.play = function () {
		this.passive = false;
	};
	LogicSystem.prototype.pause = function () {
		this.passive = true;
	};
	LogicSystem.prototype.stop = function () {
		this.passive = true;
	};

	return LogicSystem;
});