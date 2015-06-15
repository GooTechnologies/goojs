(function () {
	'use strict';

	function Structure() {
		this.nodes = {};
	}

	Structure.prototype.addNode = function (node) {
		this.nodes[node.id] = node;
		return this;
	};

	Structure.prototype.removeNode = function (node) {
		// remove connections to the node
		delete this.nodes[node.id];
		return this;
	};

	Structure.prototype.acceptsConnection = function (node, connection) {
		var targetNode = this.nodes[connection.to];
		if (targetNode.incomingConnections[connection.input]) {
			return {
				result: false,
				reason: 'input ' + connection.input + ' is already occupied'
			};
		}

		return {
			result: true
		};
	};

	// why proxy these operations?
	// because they'll verify the validity of the graph
	// the node alone cannot do that
	Structure.prototype.addConnection = function (node, connection) {
		var accepts = this.acceptsConnection(node, connection);
		if (!accepts.result) {
			throw new Error(
				'could not connect ' + node.id + '[' + connection.output + '] to ' +
				connection.to + '[' + connection.input + ']; ' + accepts.reason
			);
		}

		node.addConnection(connection);

		// occupy input
		var targetNode = this.nodes[connection.to];
		targetNode.incomingConnections[connection.input] = true;

		return this;
	};

	Structure.prototype.removeConnection = function (node, connection) {
		node.removeConnection(connection);
		return this;
	};

	Structure.prototype.toJSON = function () {
		return _(this.nodes).map(function (node) {
			return node.toJSON();
		});
	};

	Structure.fromJSON = function (json) {
		var structure = new Structure();
		_(json).forEach(function (nodeConfig) {
			var node = (nodeConfig.type === 'external' ? ExternalNode : FunctionNode).fromJSON(nodeConfig);
			structure.addNode(node);
		});
		return structure;
	};

	window.shaderBits = window.shaderBits || {};
	window.shaderBits.Structure = Structure;
})();