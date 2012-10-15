define(function() {
	function Material(name) {
		this.name = name;

		this.shader = null;
		this.textures = [];
	}

	return Material;
});