var LogicLayer = require('../../logic/LogicLayer');
var LogicNode = require('../../logic/LogicNode');
var LogicNodes = require('../../logic/LogicNodes');
var LogicInterface = require('../../logic/LogicInterface');

function (LogicLayer, LogicNode, LogicNodes, LogicInterface) {
	'use strict';

	/**
	 * Logic node that lets you access the logic layer of a different entity.
	 * @private
	 */
	function LogicNodeEntityProxy() {
		LogicNode.call(this);
		this.logicInterface = LogicNodeEntityProxy.logicInterface;
		this.type = 'LogicNodeEntityProxy';
	}

	LogicNodeEntityProxy.prototype = Object.create(LogicNode.prototype);
	LogicNodeEntityProxy.editorName = 'EntityProxy';

	LogicNodeEntityProxy.prototype.onConfigure = function (config) {
		this.entityRef = config.entityRef;
	};

	// Empty.
	LogicNodeEntityProxy.logicInterface = new LogicInterface('Component Proxy');
	LogicNodeEntityProxy.logicInterface.addConfigEntry({
		name: 'entityRef',
		type: 'entityRef',
		label: 'Entity'
	});

	LogicNodes.registerType('LogicNodeEntityProxy', LogicNodeEntityProxy);

	return LogicNodeEntityProxy;
});