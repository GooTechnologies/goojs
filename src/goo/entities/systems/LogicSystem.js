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
	};

	LogicSystem.prototype.deleted = function (entity) {
		delete this._entities[entity.name];
	};

	LogicSystem.prototype.process = function (entities, tpf) {
		for (var i=0;i<entities.length;i++)
		{
			var e = entities[i];
			if (e.logicComponent !== undefined)
				e.logicComponent.process(tpf);
		}
		
		this.logicLayer.process(tpf);
	};

	LogicSystem.prototype.play = function () {
		this.passive = false;
		
		// notify system start.
		this.forEachLogicObject(function(o) { if (o.onSystemStopped !== undefined) o.onSystemStarted; });
	}
	
	LogicSystem.prototype.forEachLogicObject = function(f) {
		for (var n in this._entities)
		{
			var e = this._entities[n];
			if (e.logicComponent !== undefined)
				e.logicComponent.logicLayer.forEachLogicObject(f);
		}
	}
	
	LogicSystem.prototype.pause = function () {
		this.passive = true;

		// notify system stop for pause
		this.forEachLogicObject(function(o) { if (o.onSystemStopped !== undefined) o.onSystemStopped(true); });
	};
	
	LogicSystem.prototype.stop = function () {
		this.passive = true;

		// notify system (full) stop
		this.forEachLogicObject(function(o) { if (o.onSystemStopped !== undefined) o.onSystemStopped(false); });
		
		// now that logic layer is cleared, need to put them back in on play.
		for (var k in this._entities)
			this._entities[k].inserted = false;
	};

	return LogicSystem;
});