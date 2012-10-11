define(function() {
	function RenderSystem(renderList) {
		System.call(this, 'RenderSystem', null, true);

		this.renderList = renderList;
	}

	RenderSystem.prototype = Object.create(System.prototype);

	RenderSystem.prototype.render = function(renderer) {
		for (i in renderList) {
			var entity = renderList[i];
			this.renderEntity(renderer, entity);
		}
	};

	RenderSystem.prototype.renderEntity = function(renderer, entity) {

	};

	return RenderSystem;
});