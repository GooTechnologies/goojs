(function () {
	'use strict';

	var NodeCommons = shaderBits.NodeCommons;
	var Connection = shaderBits.Connection;

	function ExternalNode(id) {
		this.id = id;
		this.type = 'external';
		this.external = {
			name: '',
			inputType: '',
			dataType: ''
		};
		this.outputsTo = [];
	}

	ExternalNode.prototype.acceptsConnection = NodeCommons.acceptsConnection;
	ExternalNode.prototype.addConnection = NodeCommons.addConnection;
	ExternalNode.prototype.removeConnection = NodeCommons.removeConnection;

	ExternalNode.prototype.toJSON = function () {
		return {
			id: this.id,
			type: this.type,
			external: {
				name: this.external.name,
				inputType: this.external.inputType,
				dataType: this.external.dataType
			},
			outputsTo: this.outputsTo.map(function (outputTo) {
				return outputTo.toJSON();
			})
		};
	};

	ExternalNode.fromJSON = function (config) {
		var node = new ExternalNode(config.id);
		node.type = 'external';
		node.external = _.clone(config.external);
		config.outputsTo.forEach(function (outputTo) {
			node.addConnection(Connection.fromJSON(outputTo));
		});
		return node;
	};

	window.shaderBits = window.shaderBits || {};
	window.shaderBits.ExternalNode = ExternalNode;
})();