define([
	'goo/logic/LogicInterface',
	'goo/logic/LogicLayer',
	'goo/logic/LogicNodes',
	'goo/entities/components/Component'
],
/** @lends */
function (
	LogicInterface,
	LogicLayer,
	LogicNodes,
	Component
) {
	"use strict";

	/**
	*
	 */
	function LogicComponent(entity) {
	
		Component.call(this);
		
		this.type = 'LogicComponent';
		this.parent = null;
		this.logicInstance = null;
		
		// these used to be global but aren't any longer.
		this.logicLayer = null;
		this.nodes = {};
		
		this._entity = entity;
	}
	
	LogicComponent.prototype = Object.create(Component.prototype);
	
	LogicComponent.prototype.configure = function(conf)
	{
		// cleanup.
		for (var x in this.nodes)
		{
			if (this.nodes[x].onSystemStopped !== undefined)
				this.nodes[x].onSystemStopped(false);
		}
		
		if (this.logicLayer != null)
			this.logicLayer.cleanup();

		this.logicLayer = new LogicLayer(this._entity._world, this._entity);
		
		this.nodes = {};
		
		for (var k in conf.logicNodes)
		{
			var ln = conf.logicNodes[k];
			var fn = LogicNodes.getClass(ln.type);
			var obj = new fn(ln, this._entity._world);
			
			obj.configure(ln);
			obj.addToLogicLayer(this.logicLayer, ln.id);
			
			this.nodes[k] = obj;
		}
		
		for (var k in conf.logicNodes)
		{
			var obj = this.nodes[k];
			obj.onConnected(obj.logicInstance);
		}
	}
	
	LogicComponent.prototype.process = function(tpf)
	{
		if (this.logicLayer != null)
			this.logicLayer.process(tpf);
	}
	
	return LogicComponent;

});