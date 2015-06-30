(function () {
	'use strict';

	var Node = shaderBits.Node;
	var Connection = shaderBits.Connection;
	var InPort = shaderBits.InPort;

	function ExternalOutputNode(id, config) {
		Node.call(this, id);

		this.type = 'external-output';
		this.external = {
			name: config.name,
			inputType: config.inputType,
			dataType: config.dataType
		};
		this.singleInPort = new InPort('value', config.dataType);
		this.singleInPort._node = this;
		this._context = null;
		Object.seal(this);
	}

	ExternalOutputNode.prototype = Object.create(Node.prototype);
	ExternalOutputNode.prototype.constructor = ExternalOutputNode;

	ExternalOutputNode.prototype.toJSON = function () {
		return {
			id: this.id,
			type: this.type,
			external: {
				name: this.external.name,
				inputType: this.external.inputType,
				dataType: this.external.dataType
			},
			outputsTo: []
		};
	};

	ExternalOutputNode.fromJSON = function (config) {
		var node = new ExternalOutputNode(config.id, config.external);

		config.outputsTo.forEach(function (outputTo) {
			node.addConnection(Connection.fromJSON(outputTo));
		});

		return node;
	};

	window.shaderBits = window.shaderBits || {};
	window.shaderBits.ExternalOutputNode = ExternalOutputNode;
})();