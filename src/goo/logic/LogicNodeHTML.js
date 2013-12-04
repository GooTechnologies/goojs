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
		function LogicNodeHTML() {
			LogicNode.call(this);
			this.logicInterface = LogicNodeHTML.logicInterface;
			this.type = "LogicNodeHTML";
			this.domElement = null;
		}

		LogicNodeHTML.prototype = Object.create(LogicNode.prototype);
		LogicNodeHTML.editorName = "HTML Div";

		LogicNodeHTML.prototype.onSystemStarted = function() {
			this.domElement = document.createElement('div');
			this.domElement.innerHTML = "Bananen Gurken";
			document.body.addChild(this.domElement);
		};

		LogicNodeHTML.prototype.onSystemStopped = function(stopForPause) {
			if (this.domElement != null)
			{
				document.body.removeChild(this.domElement);
				this.domElement = null;
			}
		};

		LogicNodeHTML.logicInterface = new LogicInterface();
		LogicNodeHTML.logicInterface.addConfigEntry({name: 'HTML', type: 'html', label: 'Content'});
		LogicNodes.registerType("LogicNodeHTML", LogicNodeHTML);

		return LogicNodeHTML;
	});