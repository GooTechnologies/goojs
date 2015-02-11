define([
	'goo/entities/systems/System',
	'goo/renderer/Material',
	'goo/renderer/MeshData',
	'goo/renderer/shaders/ShaderLib',
	'goo/math/Vector3'
],
/** @lends */
function (
		System,
		Material,
		MeshData,
		ShaderLib,
		Vector3) {
		'use strict';

    //LINE RENDERER
    function LineRenderer(owner, colorStr)
    {
		this.owner = owner;
	
		//convert string to array
        var colorArr = JSON.parse(colorStr);

        this.material = new Material(ShaderLib.simpleColored);
        this.material.uniforms.color = colorArr;
        
        this.meshData = new MeshData(MeshData.defaultMap([MeshData.POSITION]), this.MAX_NUM_LINES*2, 0);
        this.meshData.indexModes = ['Lines'];

        this.vertices = this.meshData.getAttributeBuffer(MeshData.POSITION);

        this.entity = this.owner.world.createEntity(this.meshData, this.material).addToWorld();

        this.numRenderingLines = 0;
        this.meshData.vertexCount = 0;
    }

    LineRenderer.prototype.MAX_NUM_LINES = 170000;
    
	
    LineRenderer.prototype.update = function()
    {
        if(this.numRenderingLines !== 0 || this.meshData.vertexCount !== 0)
        {
            this.meshData.vertexCount = Math.min(this.numRenderingLines, this.MAX_NUM_LINES)*2;
            this.meshData.setVertexDataUpdated();
        }
        this.numRenderingLines = 0;
    };

    LineRenderer.prototype.remove = function()
    {
        this.entity.removeFromWorld();

        this.vertices = undefined;
        //manually call MeshData.vertexData.destroy since MeshData.destroy is broken
        this.meshData.vertexData.destroy(this.owner.world.gooRunner.renderer.context);
        this.meshData = undefined;
        this.material = undefined;
    };


    LineRenderer.prototype.addLine = function(start, end) {
		//no need to continue if we already reached MAX_NUM_LINES
		if(this.numRenderingLines >= this.MAX_NUM_LINES)
        {
            return;
        }
		
        for(var i=0; i<3; i++)
        {
            this.vertices[this.numRenderingLines*6+i] = start.data[i];
            this.vertices[this.numRenderingLines*6+3+i] = end.data[i];
        }

        this.numRenderingLines++;
    };


    //LINE RENDERING SYSTEM
    function LineRenderSystem(world){
        System.call(this, 'LineRenderSystem', []);

        this.renderers = [];
		this.world = world;
    }
    LineRenderSystem.prototype = Object.create(System.prototype);

	var tmpVec1 = new Vector3();
	var tmpVec2 = new Vector3();
	var tmpVec3 = new Vector3();

    //setup basic colors
    LineRenderSystem.prototype.WHITE = "[1,1,1]";
    LineRenderSystem.prototype.RED = "[1,0,0]";
    LineRenderSystem.prototype.GREEN = "[0,1,0]";
    LineRenderSystem.prototype.BLUE = "[0,0,1]";
    LineRenderSystem.prototype.AQUA = "[0,1,1]";
    LineRenderSystem.prototype.MAGENTA = "[1,0,1]";
    LineRenderSystem.prototype.YELLOW = "[1,1,0]";
    LineRenderSystem.prototype.BLACK = "[0,0,0]";

    //Draw a line in 3d space
    LineRenderSystem.prototype.drawLine = function(start, end, colorStr) {

        var lineRenderer = this.renderers[colorStr];
        if (!lineRenderer)
        {
            //add a new LineRenderer
            lineRenderer = this.renderers[this.renderers.length] = new LineRenderer(this, colorStr);

            //reference a string index to the actual object
            this.renderers[colorStr] = lineRenderer;
        }
        lineRenderer.addLine(start, end);
    };

    //used for drawing AA-Boxes
    LineRenderSystem.prototype.drawAxisLine = function(startIn, diff, startIndex, endIndex, startMul, endMul, colorStr, matrix) {
        var start = tmpVec2.setVector(startIn);
        start.data[startIndex] += diff.data[startIndex]*startMul;

        var end = tmpVec3.setVector(start);
        end.data[endIndex] += diff.data[endIndex]*endMul;

        if(matrix)
        {
            matrix.applyPostPoint(start);
            matrix.applyPostPoint(end);
        }

        this.drawLine(start, end, colorStr);
    };

    //Draw an axis-aligned box in 3d space
    LineRenderSystem.prototype.drawAABox = function(min, max, colorStr, matrix) {
        for(var a=0; a<3; a++)
        {
            var diff = tmpVec1.setVector(max).subVector(min);
            for(var b=0; b<3; b++)
            {
                if(b != a) {
                    this.drawAxisLine(min, diff, a, b, 1, 1, colorStr, matrix);
                }
            }

            this.drawAxisLine(max, diff, a, a, -1, 1, colorStr, matrix);
            this.drawAxisLine(min, diff, a, a, 1, -1, colorStr, matrix);
        }
    };

    LineRenderSystem.prototype.process = function (){
        for(var i=0; i<this.renderers.length; i++) {
            this.renderers[i].update();
        }
    };

    LineRenderSystem.prototype.remove = function (){
        for(var i=0; i<this.renderers.length; i++)
        {
            if(this.renderers[i])
            {
                this.renderers[i].remove();
            }
        }
        this.renderers.length = 0;

        this.owner.world.gooRunner.renderer.clearShaderCache();
    };
	
	return LineRenderSystem;
});