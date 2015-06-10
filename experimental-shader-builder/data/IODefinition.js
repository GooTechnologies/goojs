(function () {
	'use strict';

	function IODefinition(name, type) {
		this.name = name;
		this.type = type;
	}

	IODefinition.prototype.accepts = function (conenction) {
		return this.type === conenction.type;
	};
})();
