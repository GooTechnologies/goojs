(function () {
	'use strict';

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
})();