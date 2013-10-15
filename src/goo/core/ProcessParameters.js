define( [],
	function() {
		"use strict";

		function ProcessParameters() {
			this.actualTime              = -1;
			this.time                    = 0;
			this.deltaTime               = 0;
			this.timeScale               = 1;
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

		ProcessParameters.prototype.setTimeScale = function( value ) {
			this.timeScale = value;
		};

		ProcessParameters.prototype.resetTime = function() {
			this.actualTime = -1;
			this.time       = 0;
			this.deltaTime  = 0;
		};

		ProcessParameters.prototype.updateTime = function( timeStamp ) {
			if( this.actualTime === -1 ) {
				this.actualTime = timeStamp;
			}

			// REVIEW: Add smoothing and cap

			this.deltaTime  = ( this.actualTime - timeStamp ) * this.timeScale;
			this.actualTime = timeStamp;
			this.time      += this.deltaTime;
		};

		return ProcessParameters;
	}
);