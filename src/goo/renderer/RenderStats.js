function RenderStats() {
	this.reset();
}

RenderStats.prototype.reset = function () {
	this.calls = 0;
	this.vertices = 0;
	this.indices = 0;
};

RenderStats.prototype.toString = function () {
	return 'Calls: ' + this.calls +
		'<br/>Vertices: ' + this.vertices +
		'<br/>Indices: ' + this.indices;
};

module.exports = RenderStats;