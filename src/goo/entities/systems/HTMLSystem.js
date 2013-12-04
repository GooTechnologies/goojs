define(
	[
	"goo/entities/systems/System", 
	"goo/renderer/Renderer", 
	"goo/math/Matrix4x4", 
	'goo/math/MathUtils', 
	'goo/math/Vector3'], 
	/** @lends */
	function (System, Renderer, Matrix4x4, MathUtils, Vector3) {
	
	"use strict";

	function HTMLSystem (renderer) {
	
		System.call(this, "HTMLSystem", ["TransformComponent", "HTMLComponent"]);
		this.renderer = renderer;
		
		/*
		if(document.querySelector)
		{
			    this.viewDom = document.querySelector("#view");
			    this.containerDom = document.querySelector("#cam1");
			    this.containerDom2 = document.querySelector("#cam2");
		}
		*/

		this.tmpVector = new Vector3();
	}

	HTMLSystem.prototype = Object.create(System.prototype);

	// Copied from CSSTransformComponent
	var prefixes = ["", "-webkit-", "-moz-", "-ms-", "-o-"];
	var setStyle = function (element, property, style) {
		for (var j = 0; j < prefixes.length; j++) {
			element.style[prefixes[j] + property] = style;
		}
	};

	HTMLSystem.prototype.process = function (entities) {
		if (entities.length === 0) {
			return;
		}
		
		
		var camera = Renderer.mainCamera;
		var screenWidth = this.renderer.domElement.width;
		var screenHeight = this.renderer.domElement.height;
		
		
		for (var i = 0; i < entities.length; i++) {
			var entity = entities[i];
			var component = entity.getComponent('HTMLComponent');

			// compute world position.
			camera.getScreenCoordinates(entity.transformComponent.transform.translation, screenWidth, screenHeight, this.tmpVector);
			
			setStyle(component.domElement, 'transform', 'translate(-50%, -50%) translate(' + this.tmpVector.x + 'px, ' + this.tmpVector.y + 'px)');
			
			// project
		}
	};

	return HTMLSystem;
});
