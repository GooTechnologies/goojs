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
	function LogicComponent() {
	
		Component.call(this);
		
		this.type = 'LogicComponent';
		this.parent = null;
		this._time = 0;
		this.logicInstance = null;
		
		// these used to be global but aren't any longer.
		this.logicLayer = null;
		this.nodes = {};
	}
	
	LogicComponent.prototype = Object.create(Component.prototype);
	
	LogicComponent.prototype.configure = function(conf)
	{
		this.logicLayer = new LogicLayer();
		this.nodes = {};
		
		for (var k in conf.logicNodes)
		{
			var ln = conf.logicNodes[k];
			var fn = LogicNodes.getClass(ln.type);
			var obj = new fn();
			
			obj.configure(ln);
			obj.addToLogicLayer(this.logicLayer);
			
			this.nodes[k] = obj;
		}
	}
	
	LogicComponent.prototype.process = function(tpf)
	{
		if (this.logicLayer != null)
			this.logicLayer.process(tpf);
	}
	
	// Output ports from this component	
	LogicComponent.logicInterface = new LogicInterface();

	// Adding
	LogicComponent.prototype.insertIntoLogicLayer = function(logicLayer, name) {
		this.logicInstance = logicLayer.addInterfaceInstance(LogicComponent.logicInterface, this, name, true);
	}

	return LogicComponent;

});