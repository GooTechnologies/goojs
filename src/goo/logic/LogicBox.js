define(
       ['goo/logic/LogicInterface']
       ,
	/** @lends */
	function (LogicInterface) {
	"use strict";

	/**
	 * @class Base class/module for all logic boxes
	 */
	function LogicBox() {
		this.logicInterface = new LogicInterface();
	}

	return Component;
});
