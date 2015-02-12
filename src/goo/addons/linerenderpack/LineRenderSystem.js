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
     * updates all of its {LineRenderer}'s and exposes methods for drawing primitives
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

    //setup basic colors
    LineRenderSystem.prototype.WHITE = '[1,1,1]';
    LineRenderSystem.prototype.RED = '[1,0,0]';
    LineRenderSystem.prototype.GREEN = '[0,1,0]';
    LineRenderSystem.prototype.BLUE = '[0,0,1]';
    LineRenderSystem.prototype.AQUA = '[0,1,1]';
    LineRenderSystem.prototype.MAGENTA = '[1,0,1]';
    LineRenderSystem.prototype.YELLOW = '[1,1,0]';
    LineRenderSystem.prototype.BLACK = '[0,0,0]';

    /**
     * draws a line between two {@link Vector3}'s with the specified color
     * @param {Vector3} start
     * @param {Vector3} end
     * @param {String} colorStr following the format of '[red,green,blue]' where red,green,blue ranges between 0-1
     * @example
     * var v1 = new Vector3(0,0,0);
     * var v2 = new Vector3(13,3,7);
     * var color = "[1,0,0]";
     * LineRenderSystem.drawLine(v1, v2, color);
     */
    LineRenderSystem.prototype.drawLine = function(start, end, colorStr) {

        var lineRenderer = this._renderers[colorStr];
        if (!lineRenderer)
        {
            lineRenderer = this._renderers[this._renderers.length] = new LineRenderer(this, colorStr);

            //reference a string color index to the actual object
            this._renderers[colorStr] = lineRenderer;
        }
        lineRenderer.addLine(start, end);
    };

    /**
     * used internally to draw a line for an axis aligned box segment
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
     * draws an axis aligned box between the min and max points, can be transformed to a specific space using the matrix
     * @param {Vector3} min
     * @param {Vector3} max
     * @param {String} colorStr
     * @param {Matrix4x4} transformMatrix
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