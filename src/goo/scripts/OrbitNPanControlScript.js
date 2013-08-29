define([
	'goo/scripts/OrbitCamControlScript',
	'goo/renderer/Renderer',
	'goo/math/Vector3'
], function(
	OrbitCamControlScript,
	Renderer,
	Vector3
) {

// REVIEW: I think a bit of jsDoc would be a great idea and maybe a short introduction what this class does.

	function SuperCamScript(goo, properties) {
		properties = properties || {};
		properties.dragButton = 2;
		OrbitCamControlScript.call(this, properties);
		this.panState = {
			buttonDown : false,
			lastX: NaN,
			lastY: NaN,
			lastPos: new Vector3()
		};
		this.goo = goo;
	}

	SuperCamScript.prototype = Object.create(OrbitCamControlScript.prototype);


	SuperCamScript.prototype.updateButtonState = function(buttonIndex, down) {
		OrbitCamControlScript.prototype.updateButtonState.call(this, buttonIndex, down);
		if (buttonIndex === 1) {
			this.panState.buttonDown = down;
			if(down) {
				this.panState.lastX = NaN;
				this.panState.lastY = NaN;
				this.panState.lastPos.setv(this.lookAtPoint);
			}
		}
	};
	SuperCamScript.prototype.updateDeltas = function(mouseX, mouseY) {
		OrbitCamControlScript.prototype.updateDeltas.call(this, mouseX, mouseY);
		var v = new Vector3();
		var u = new Vector3();

		if (isNaN(this.panState.lastX) || isNaN(this.panState.lastY)) {
			this.panState.lastX = mouseX;
			this.panState.lastY = mouseY;
		}
		if(this.panState.buttonDown) {
			var c = Renderer.mainCamera;


			c.getScreenCoordinates(this.panState.lastPos, 1, 1, u);
			u.x -= (mouseX - this.panState.lastX) / this.goo.renderer.viewportWidth;
			u.y += (mouseY - this.panState.lastY) / this.goo.renderer.viewportHeight;
			c.getWorldCoordinates(
				u.x,
				u.y,
				1,
				1,
				u.z,
				v
			);
			// REVIEW: made the console.log conditional
			if( this.debug)
				console.log(v.data);
			this.lookAtPoint.setv(v);
			this.dirty = true;
		}
	};

	return SuperCamScript;
});