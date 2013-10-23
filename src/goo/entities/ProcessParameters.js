define( [],
	function() {
		"use strict";

		function ProcessParameters() {
			this.actualTime              = -1;
			this.time                    = 0;
			this.timeInSeconds           = 0;
			this.deltaTime               = 0;
			this.deltaTimeInSeconds      = 0;
			this.timeScale               = 1;
			this.parentGlobalMatrixStack = [];
			this.parentGlobalMatrix      = undefined;
			this.camera                  = undefined;
			this.cameraInverseMatrix     = undefined;

			this.timeSmoothingEnabled = true;
			this.timeSmoothingCount   = 10;
			this.timeSmoothingArray   = [];
			this.timeSmoothingIndex   = 0;

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

			this.deltaTime          = Math.min( Math.max( 1, ( timeStamp - this.actualTime ) * this.timeScale ), 1000 );
			this.deltaTimeInSeconds = this.deltaTime / 1000;

			// smooth

			if( this.timeSmoothingEnabled ) {
				var average = 0;
				var timeSmoothingArray = this.timeSmoothingArray;
				var tl = timeSmoothingArray.length;

				timeSmoothingArray[ this.timeSmoothingIndex ] = this.deltaTimeInSeconds;

				while( tl-- ) {
					average += timeSmoothingArray[ tl ];
				}
				average /= timeSmoothingArray.length;

				this.timeDeltaTimeInSeconds = average;
				this.timeSmoothingIndex   = ( this.timeSmoothingIndex + 1 ) % this.timeSmoothingCount;
			}

			// update times 

			this.actualTime    = timeStamp;
			this.time         += this.deltaTime;
			this.timeInSeconds = this.time / 1000; 
		};

		return ProcessParameters;
	}
);