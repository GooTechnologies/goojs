define( [],
	function() {
		"use strict";

		function ProcessParameters() {
			this.parentGlobalMatrixStack = [];
			this.parentGlobalMatrix      = undefined;
			this.camera                  = undefined;
			this.cameraInverseMatrix     = undefined;

			// todo: possibly add different types of forcing/skipping behaviour flags
		}

		ProcessParameters.prototype.clearGlobalMatrix = function() {
			this.parentGlobalMatrixStack.length = 0;
			this.parentGlobalMatrix             = undefined;
		};

		ProcessParameters.prototype.pushGlobalMatrix = function( matrix ) {
			this.parentGlobalMatrixStack.push( this.parentGlobalMatrix );
			this.parentGlobalMatrix = matrix;
		};

		ProcessParameters.prototype.popGlobalMatrix = function() {
			this.parentGlobalMatrix = this.parentGlobalMatrixStack.pop();
		};

		return ProcessParameters;
	}
);