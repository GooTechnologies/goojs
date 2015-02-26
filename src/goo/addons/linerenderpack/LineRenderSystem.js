define([
	'goo/entities/systems/System',
	'goo/addons/linerenderpack/LineRenderer',
	'goo/math/Vector3'
],
function (
		System,
        LineRenderer,
		Vector3) {
		'use strict';

    /**
     * Updates all of its {LineRenderer}'s and exposes methods for drawing primitive line shapes
     * @param {World} world the world this system exists in
     */
    function LineRenderSystem(world){
        System.call(this, 'LineRenderSystem', []);

        this._renderers = [];
		this.world = world;
    }
    LineRenderSystem.prototype = Object.create(System.prototype);

	var tmpVec1 = new Vector3();
	var tmpVec2 = new Vector3();
	var tmpVec3 = new Vector3();

    //setup a preset of colors
    LineRenderSystem.prototype.WHITE = new Vector3(1,1,1);
    LineRenderSystem.prototype.RED = new Vector3(1,0,0);
    LineRenderSystem.prototype.GREEN = new Vector3(0,1,0);
    LineRenderSystem.prototype.BLUE = new Vector3(0,0,1);
    LineRenderSystem.prototype.AQUA = new Vector3(0,0.5,0.5);
    LineRenderSystem.prototype.MAGENTA = new Vector3(1,0,1);
    LineRenderSystem.prototype.YELLOW = new Vector3(1,1,0);
    LineRenderSystem.prototype.BLACK = new Vector3(0,0,0);


	/**
	 * Packs a {Vector3} color to a {number}.
	 * @param {Vector3} color
	 * @returns {number} the packed color.
	 * @example
	 * var packedColorRed = lineRenderSystem.packColor(lineRenderSystem.RED);
	 * console.log(packedColorRed); // would output
	 */
	LineRenderSystem.prototype.packColor = function(color) {
        var r = Math.floor(color.x*255);
        var g = Math.floor(color.y*255);
        var b = Math.floor(color.z*255);

      return r*255+g*255*255+b;
    };

    /**
     * Draws a line between two {@link Vector3}'s with the specified color.
     * @param {Vector3} start
     * @param {Vector3} end
     * @param {Vector3} color a color with its components between 0-1
     * @example
     * var vector1 = new Vector3(0,0,0);
     * var vector2 = new Vector3(13,3,7);
     * var redColor = lineRenderSystem.RED;
     * lineRenderSystem.drawLine(v1, v2, redColor);
     */
    LineRenderSystem.prototype.drawLine = function(start, end, color) {

        var packedColor = this.packColor(color);

        var lineRenderer = this._renderers[packedColor];
        if (!lineRenderer)
        {
            lineRenderer = this._renderers[this._renderers.length] = new LineRenderer(this, color);

            //reference a string color index to the actual object
            this._renderers[packedColor] = lineRenderer;
        }
        lineRenderer.addLine(start, end);
    };

    /**
     * Used internally to draw a line for an axis aligned box segment
     * @param {Vector3} startIn
     * @param {Vector3} diff
     * @param {int} startIndex
     * @param {int} endIndex
     * @param {float} startMul
     * @param {float} endMul
     * @param {String} colorStr
     * @param {Matrix4x4} transformMatrix
     */
    LineRenderSystem.prototype._drawAxisLine = function(startIn, diff, startIndex, endIndex, startMul, endMul, colorStr, transformMatrix) {
        var start = tmpVec2.setVector(startIn);
        start.data[startIndex] += diff.data[startIndex]*startMul;

        var end = tmpVec3.setVector(start);
        end.data[endIndex] += diff.data[endIndex]*endMul;

        if(transformMatrix !== undefined)
        {
            transformMatrix.applyPostPoint(start);
            transformMatrix.applyPostPoint(end);
        }

        this.drawLine(start, end, colorStr);
    };

    /**
     * Draws an axis aligned box between the min and max points, can be transformed to a specific space using the matrix
     * @param {Vector3} min
     * @param {Vector3} max
     * @param {String} colorStr
     * @param {Matrix4x4} [transformMatrix]
     */
    LineRenderSystem.prototype.drawAABox = function(min, max, colorStr, transformMatrix) {
        for(var a=0; a<3; a++)
        {
            var diff = tmpVec1.setVector(max).subVector(min);
            for(var b=0; b<3; b++)
            {
                if(b !== a) {
                    this._drawAxisLine(min, diff, a, b, 1, 1, colorStr, transformMatrix);
                }
            }

            this._drawAxisLine(max, diff, a, a, -1, 1, colorStr, transformMatrix);
            this._drawAxisLine(min, diff, a, a, 1, -1, colorStr, transformMatrix);
        }
    };

    /**
     * Draws a cross at a position with the given color and size
     * @param {Vector3} position
     * @param {String} colorStr
     * @param {float} [size=0.05]
     */
    LineRenderSystem.prototype.drawCross = function(position, colorStr, size) {

        size = size || 0.05;

        var start = tmpVec1.setVector(position).addDirect(-size,0.0,-size);
        var end = tmpVec2.setVector(position).addDirect(size,0.0,size);
        this.drawLine(start, end, colorStr);

        start = tmpVec1.setVector(position).addDirect(size,0.0,-size);
        end = tmpVec2.setVector(position).addDirect(-size,0.0,size);
        this.drawLine(start, end, colorStr);

        start = tmpVec1.setVector(position).addDirect(0,-size,0.0);
        end = tmpVec2.setVector(position).addDirect(0.0,size,0.0);
        this.drawLine(start, end, colorStr);
    };

    LineRenderSystem.prototype.process = function (){
        for(var i=0; i<this._renderers.length; i++) {
            this._renderers[i].update();
        }
    };

    LineRenderSystem.prototype.remove = function (){
        for(var i=0; i<this._renderers.length; i++)
        {
            if(this._renderers[i])
            {
                this._renderers[i].remove();
            }
        }
        this._renderers.length = 0;

        this.world.gooRunner.renderer.clearShaderCache();
    };

	return LineRenderSystem;
});