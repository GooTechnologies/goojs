var System = require('../entities/systems/System');
var SystemBus = require('../entities/SystemBus');
var Renderer = require('../renderer/Renderer');
var LogicLayer = require('./logic/LogicLayer');
var LogicInterface = require('./logic/LogicInterface');

// REVIEW: this description seems inaccurate
/**
 * Updates cameras/cameracomponents with ther transform component transforms
 * @private
 */
function LogicSystem() {
	System.call(this, 'LogicSystem', null);

	this.passive = true;
	this._entities = {};
}

LogicSystem.prototype = Object.create(System.prototype);

LogicSystem.prototype.inserted = function (entity) {
	this._entities[entity.name] = {
		entity: entity,
		inserted: false // REVIEW: is this ever accessed? seems to start off false and be reset to false again in .stop, several lines below
	};
};

LogicSystem.prototype.deleted = function (entity) {
	delete this._entities[entity.name];
};

LogicSystem.prototype.process = function (entities, tpf) {
	for (var i = 0; i < entities.length; i++) {
		var e = entities[i];
		if (e.logicComponent !== undefined) {
			e.logicComponent.process(tpf);
		}
	}
};

/**
 * Called when proxy entities want to resolve their entities. Called from LogicLayer.
 */
LogicSystem.prototype.resolveEntityRef = function (entityRef) {
	var e = this._entities[entityRef];
	if (e !== undefined) {
		return e.entity;
	}
	// REVIEW: no need to check, function returns undefined anyways
};

LogicSystem.prototype.getLayerByEntity = function (entityName) {
	var e = this._entities[entityName];
	if (e === undefined) {
		return e;
	}

	var c = e.entity.logicComponent;
	if (c === undefined) {
		return c;
	}

	return c.logicLayer;
};

LogicSystem.prototype.makeOutputWriteFn = function (sourceEntity, outPortDesc) {
	// Lets do this the really slow and stupid way for now!

	// TODO: Make sure this function is cached and only generated once
	//
	var matches = [];
	this.forEachLogicObject(function (o) {
		// Look for entities that point to this here.
		if (o.type === 'LogicNodeEntityProxy' && o.entityRef === sourceEntity.name) {
			matches.push([o.logicInstance, LogicInterface.makePortDataName(outPortDesc)]);
			// REVIEW: use objects instead of arrays when representing pairs ('0' and '1' are harder to read than some proper names)
		}
	});

	return function (v) {
		for (var i = 0; i < matches.length; i++) {
			LogicLayer.writeValue(matches[i][0], matches[i][1], v);
		}
	};
};

LogicSystem.prototype.forEachLogicObject = function (f) {
	for (var n in this._entities) {
		var e = this._entities[n].entity;
		if (e.logicComponent !== undefined) { // REVIEW: can this ever be undefined?
			e.logicComponent.logicLayer.forEachLogicObject(f);
		}
	}
};

LogicSystem.prototype.play = function () {
	this.passive = false;

	// notify system start.
	this.forEachLogicObject(function (o) {
		if (o.onSystemStarted !== undefined) {
			o.onSystemStarted();
		}
	});
};

LogicSystem.prototype.pause = function () {
	this.passive = true;

	// notify system stop for pause
	this.forEachLogicObject(function (o) {
		if (o.onSystemStopped !== undefined) {
			o.onSystemStopped(true);
		}
	});
};

LogicSystem.prototype.stop = function () {
	this.passive = true;

	// notify system (full) stop
	this.forEachLogicObject(function (o) {
		if (o.onSystemStopped !== undefined) {
			o.onSystemStopped(false);
		}
	});

	// now that logic layer is cleared, need to put them back in on play.
	for (var k in this._entities) {
		this._entities[k].inserted = false;
	}
};

module.exports = LogicSystem;