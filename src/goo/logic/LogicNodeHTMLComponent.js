define(
	[
		'goo/logic/LogicLayer',
		'goo/logic/LogicNode',
		'goo/logic/LogicNodes',
		'goo/logic/LogicInterface',
		'goo/entities/components/HTMLComponent',
	],
	/** @lends */
	function(LogicLayer, LogicNode, LogicNodes, LogicInterface, HTMLComponent) {
		"use strict";

		/**
		 * @class Logic node connecting to the HTMLComponent of an entity
		 */
		function LogicNodeHTMLComponent() {
			LogicNode.call(this);
			this.logicInterface = LogicNodeHTMLComponent.logicInterface;
			this.type = "HTMLComponent";
		}

		LogicNodeHTMLComponent.prototype = Object.create(LogicNode.prototype);
		LogicNodeHTMLComponent.editorName = "HTMLComponent";

		// Logic interface set-up	
		LogicNodeHTMLComponent.logicInterface = new LogicInterface("HTML");
		LogicNodeHTMLComponent.inportElementId = LogicNodeHTMLComponent.logicInterface.addInputProperty("elementId", "string");
		LogicNodeHTMLComponent.inportAlpha = LogicNodeHTMLComponent.logicInterface.addInputProperty("alpha", "float");
		LogicNodeHTMLComponent.inportVisible = LogicNodeHTMLComponent.logicInterface.addInputProperty("visible", "bool");

		LogicNodeHTMLComponent.logicInterface.addConfigEntry({name: 'entityRef', type: 'entityRef', label: 'Entity'});

		LogicNodeHTMLComponent.prototype.onConfigure = function(config) {
			this.entityRef = config.entityRef;
		};

		LogicNodeHTMLComponent.prototype.onInputChanged = function(instDesc) {
			this.setupEntity(instDesc);
		};
		
		LogicNodeHTMLComponent.prototype.onConnected = function(instDesc) {
			this.setupEntity(instDesc);
		};		
		
		LogicNodeHTMLComponent.prototype.setupEntity = function(instDesc) {
			var entity = LogicLayer.resolveEntityRef(instDesc, this.entityRef);
			var elementId = LogicLayer.readPort(instDesc, LogicNodeHTMLComponent.inportElementId);
			
			entity.clearComponent("HTMLComponent");
			entity.setComponent(new HTMLComponent(document.getElementById(elementId)));
		};			

		LogicNodes.registerType("HTMLComponent", LogicNodeHTMLComponent);
		return LogicNodeHTMLComponent;
	});