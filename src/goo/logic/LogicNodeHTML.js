define(
	[
		'goo/logic/LogicLayer',
		'goo/logic/LogicNode',
		'goo/logic/LogicNodes',
		'goo/logic/LogicInterface',
		'goo/math/Vector3'
	],
	/** @lends */
	function(LogicLayer, LogicNode, LogicNodes, LogicInterface, Vector3) {
		"use strict";

		/**
		 * @class Logic node that calculates sine
		 */
		function LogicNodeHTML(config, world) {
			LogicNode.call(this);
			this.logicInterface = LogicNodeHTML.logicInterface;
			this.type = "LogicNodeHTML";
			this.domElement = null;
			
			this.elementID = config.id;
			this.elementParent = world.gooRunner.renderer.domElement.parentNode;
		}

		LogicNodeHTML.prototype = Object.create(LogicNode.prototype);
		LogicNodeHTML.editorName = "HTML Div";
		LogicNodeHTML.idCounter = 0;

		LogicNodeHTML.prototype.onConfigure = function(newConfig)
		{
			this.cleanup();
			
			this.domElement = document.createElement('div');
			this.domElement.id = "LogicNodeHTML_" + (LogicNodeHTML.idCounter++);
			this.domElement.style.position = 'absolute';
			this.domElement.style.zIndex = 5000;
			this.domElement.innerHTML = newConfig.html;
			this.elementParent.appendChild(this.domElement);
		}
		
		LogicNodeHTML.prototype.cleanup = function() {
			if (this.domElement != null)
			{
				this.elementParent.removeChild(this.domElement);
				this.domElement = null;
			}
		}
		
		LogicNodeHTML.prototype.onSystemStarted = function() {
		}

		LogicNodeHTML.prototype.onSystemStopped = function(stopForPause) {
		}

		LogicNodeHTML.logicInterface = new LogicInterface();
		LogicNodeHTML.logicInterface.addConfigEntry({name: 'html', type: 'text', label: 'Content'});
		LogicNodes.registerType("LogicNodeHTML", LogicNodeHTML);

		return LogicNodeHTML;
	});