(function () {
	'use strict';

	function FunctionNode(id, type) {
		this.id = id;
		this.type = type;
		this.outputsTo = [];
		this.defines = {};
	}

	FunctionNode.prototype.addConnection = NodeCommons.addConnection;
	FunctionNode.prototype.removeConnection = NodeCommons.removeConnection;

	FunctionNode.prototype.toJSON = function () {
		return {
			id: this.id,
			type: this.type,
			outputsTo: this.outputsTo.map(function (outputTo) {
				return outputTo.toJSON();
			}),
			defines: _.clone(this.defines)
		};
	};
})();