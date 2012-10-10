define(function() {
	function RenderSystem(renderList) {
		this.type = 'RenderSystem';
		this.interests = [];

		this.renderList = renderList;
	}

	return RenderSystem;
});