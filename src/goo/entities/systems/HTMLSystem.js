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
		
		console.log("Creating HTML renderer");

		/*
		if(document.querySelector)
		{
			    this.viewDom = document.querySelector("#view");
			    this.containerDom = document.querySelector("#cam1");
			    this.containerDom2 = document.querySelector("#cam2");
		}

		this.tmpMatrix = new Matrix4x4();
		this.tmpMatrix2 = new Matrix4x4();
		this.tmpVector = new Vector3();
		*/
	}

	HTMLSystem.prototype = Object.create(System.prototype);


	HTMLSystem.prototype.process = function (entities) {
		if (entities.length === 0) {
			return;
		}

		console.log("Updating HTMLSystem");
	};

	return HTMLSystem;
});
