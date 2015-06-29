(function () {
	'use strict';

	var Node = shaderBits.Node;
	var Connection = shaderBits.Connection;
	var OutPort = shaderBits.OutPort;

	function ExternalInputNode(id, config) {
		Node.call(this, id);

		this.type = 'external-input';
		this.external = {
			name: config.name,
			inputType: config.inputType,
			dataType: config.dataType
		};
		this.outputsTo = [];
		this.singleOutPort = new OutPort('value', config.dataType);
		this.singleOutPort._node = this;
		this._context = null;
		Object.seal(this);
	}

	ExternalInputNode.prototype = Object.create(Node.prototype);
	ExternalInputNode.prototype.constructor = ExternalInputNode;

	// no connectedBy methods since this node cannot be connected by anything; it has no inputs!

	ExternalInputNode.prototype.toJSON = function () {
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

	ExternalInputNode.fromJSON = function (config) {
		var node = new ExternalInputNode(config.id, config.external);

		config.outputsTo.forEach(function (outputTo) {
			node.addConnection(Connection.fromJSON(outputTo));
		});

		return node;
	};

	window.shaderBits = window.shaderBits || {};
	window.shaderBits.ExternalInputNode = ExternalInputNode;
})();