(function () {
	'use strict';

	var Node = shaderBits.Node;
	var Connection = shaderBits.Connection;
	var OutPort = shaderBits.OutPort;

	function ExternalNode(id, config) {
		Node.call(this, id);

		this.type = 'external';
		this.external = {
			name: config.name,
			inputType: config.inputType,
			dataType: config.dataType
		};
		this.outputsTo = [];
		this.singleOutPort = new OutPort('value', config.dataType); // stick to float for now
		this._context = null;
	}

	ExternalNode.prototype = Object.create(Node.prototype);
	ExternalNode.prototype.constructor = ExternalNode;

	// no connectedBy methods since this node cannot be connected by anything; it has no inputs!

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