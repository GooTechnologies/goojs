define(function() {
	function ShaderRecord() {
		this.usedProgram = null;
		this.boundAttributes = [];
		this.uniformRecords = new Hashtable();
		this.valid = false;
	}

	return ShaderRecord;
});