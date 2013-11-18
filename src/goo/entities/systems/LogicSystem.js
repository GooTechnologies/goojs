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
		this._entities = {};
	}

	LogicSystem.prototype = Object.create(System.prototype);

	LogicSystem.prototype.inserted = function (entity) {
		this._entities[entity.name] = {entity: entity, inserted:false };
	}

	LogicSystem.prototype.deleted = function (entity) {
		delete this._entities[entity.name];
	};

	LogicSystem.prototype.process = function (entities, tpf) {
		this.logicLayer.process(tpf);
	};

	LogicSystem.prototype.play = function () {
		this.passive = false;
		
		// insert all non-inserted entities.
		var logicLayer = this.logicLayer;
		for (var k in this._entities)
		{
			var e = this._entities[k];
			if (!e.inserted)
			{
				console.log("Inserting entity into logic layer");
				var counter = 0;
				e.entity.forEachComponent(function(comp, index) {
					if (comp.insertIntoLogicLayer !== undefined) {
						comp.insertIntoLogicLayer(logicLayer, k + '~' + (counter++));
					}
				});
				e.inserted = true;
			}
		}
	};
	LogicSystem.prototype.pause = function () {
		this.passive = true;
	};
	LogicSystem.prototype.stop = function () {
		this.passive = true;
		this.logicLayer.clear();
		
		// now that logic layer is cleared, need to put them back in on play.
		for (var k in this._entities)
			this._entities[k].inserted = false;
	};

	return LogicSystem;
});