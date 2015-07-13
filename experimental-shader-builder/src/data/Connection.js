define(function () {
	'use strict';

	/**
	 * An outgoing connection from a node; should be created only internally
	 * @hidden
	 * @param {string} output
	 * @param {string} to
	 * @param {string} input
	 */
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

	Connection.prototype.toJson = function () {
		return {
			output: this.output,
			to: this.to,
			input: this.input
		};
	};

	Connection.fromJson = function (json) {
		return new Connection(json.output, json.to, json.input);
	};

	return Connection;
});