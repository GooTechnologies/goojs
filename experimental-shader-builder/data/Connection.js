(function () {
	'use strict';

	function Connection(output, to, input) {
		this.output = output;
		this.to = to;
		this.input = input;
	}

	Connection.prototype.equals = function (that) {
		return this === that ||
			(this.output === that.output &&
			this.to === that.to &&
			this.input === that.input);
	};

	Connection.prototype.toJSON = function () {
		return {
			output: this.output,
			to: this.to,
			input: this.input
		};
	};

	Connection.fromJSON = function (json) {
		return new Connection(json.output, json.to, json.input);
	};

	window.shaderBits = window.shaderBits || {};
	window.shaderBits.Connection = Connection;
})();