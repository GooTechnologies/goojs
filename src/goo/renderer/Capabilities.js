define(

function () {
	'use strict';

	/**
	 * Enabled and stores webgl extensions and capabilities

	 * Extensions
	 * @property {object} CompressedTextureS3TC S3TC (DXT) compression, WEBGL_compressed_texture_s3tc
	 * @property {object} TextureFloat Floating point textures, OES_texture_float
	 * @property {object} TextureFloatLinear Linear filtering of floating point textures, OES_texture_float_linear
	 * @property {object} TextureHalfFloat 16-bit floating point textures, OES_texture_half_float
	 * @property {object} TextureHalfFloatLinear Linear filtering of 16-bit floating point textures, OES_texture_half_float_linear
	 * @property {object} StandardDerivatives Enabled dFdx/dFdy/fwidth in fragment shaders, OES_standard_derivatives
	 * @property {object} TextureFilterAnisotropic Anisotropic filtering of textures, EXT_texture_filter_anisotropic
	 * @property {object} DepthTexture Depth textures, WEBGL_depth_texture
	 * @property {object} ElementIndexUInt 32-bit index buffers, OES_element_index_uint
	 * @property {object} InstancedArrays Instanced arrays, ANGLE_instanced_arrays
	 * @property {object} BlendMinmax BlendMinmax, EXT_blend_minmax
	 * @property {object} FragDepth FragDepth, EXT_frag_depth
	 * @property {object} ShaderTextureLod ShaderTextureLod, EXT_shader_texture_lod
	 * @property {object} VertexArrayObject VertexArrayObject, OES_vertex_array_object
	 * @property {object} DrawBuffers Multiple rendertargets, WEBGL_draw_buffers

	 * Properties
	 * @property {number} maxTexureSize Maximum 2D texture size
	 * @property {number} maxCubemapSize Maximum cubemap size
	 * @property {number} maxRenderbufferSize Maximum renderbuffer size
	 * @property {number[]} maxViewPortDims Maximum viewport size [x, y]
	 * @property {number} maxVertexTextureUnits Maximum vertex shader texture units
	 * @property {number} maxFragmentTextureUnits Maximum fragment shader texture units
	 * @property {number} maxCombinedTextureUnits Maximum total texture units
	 * @property {number} maxVertexAttributes Maximum vertex attributes
	 * @property {number} maxVertexUniformVectors Maximum vertex uniform vectors
	 * @property {number} maxFragmentUniformVectors Maximum fragment uniform vectors
	 * @property {number} maxVaryingVectors Maximum varying vectors
	 * @property {number} aliasedPointSizeRange Point size min/max [min, max]
	 * @property {number} aliasedLineWidthRange Line width min/max [min, max]
	 * @property {number} samples Antialiasing sample size
	 * @property {number} sampleBuffers Sample buffer count
	 * @property {number} depthBits Depth bits
	 * @property {number} stencilBits Stencil bits
	 * @property {number} subpixelBits Sub-pixel bits
	 * @property {number} supportedExtensionsList Supported extension as an array
	 * @property {number} renderer Renderer name
	 * @property {number} vendor Vendor name
	 * @property {number} version Version string
	 * @property {number} shadingLanguageVersion Shadinglanguage version string
	 */
	function Capabilities() {
	}

	/**
	 * Initialize capabilities from rendering context.
	 * @param {WebGLRenderingContext} context WebGLRenderingContext
	 */
	Capabilities.init = function (context) {
		// Extensions
		Capabilities.CompressedTextureS3TC = context.getExtension("WEBGL_compressed_texture_s3tc")
										|| context.getExtension("MOZ_WEBGL_compressed_texture_s3tc")
										|| context.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");
		Capabilities.TextureFloat = context.getExtension('OES_texture_float');
		Capabilities.TextureFloatLinear = context.getExtension('OES_texture_float_linear');
		Capabilities.TextureHalfFloat = context.getExtension('OES_texture_half_float');
		Capabilities.TextureHalfFloatLinear = context.getExtension('OES_texture_half_float_linear');
		Capabilities.StandardDerivatives = context.getExtension('OES_standard_derivatives');
		Capabilities.TextureFilterAnisotropic = context.getExtension('EXT_texture_filter_anisotropic')
										|| context.getExtension('MOZ_EXT_texture_filter_anisotropic')
										|| context.getExtension('WEBKIT_EXT_texture_filter_anisotropic');
		Capabilities.DepthTexture = context.getExtension('WEBGL_depth_texture')
										|| context.getExtension('WEBKIT_WEBGL_depth_texture')
										|| context.getExtension('MOZ_WEBGL_depth_texture');
		Capabilities.ElementIndexUInt = context.getExtension('OES_element_index_uint');

		// verify these
		Capabilities.InstancedArrays = context.getExtension('ANGLE_instanced_arrays');
		Capabilities.BlendMinmax = context.getExtension('EXT_blend_minmax');
		Capabilities.FragDepth = context.getExtension('EXT_frag_depth');
		Capabilities.ShaderTextureLod = context.getExtension('EXT_shader_texture_lod');
		Capabilities.VertexArrayObject = context.getExtension('OES_vertex_array_object');
		Capabilities.DrawBuffers = context.getExtension('WEBGL_draw_buffers');
		// end verify

		// Parameters
		Capabilities.maxTexureSize = context.getParameter(context.MAX_TEXTURE_SIZE);
		Capabilities.maxCubemapSize = context.getParameter(context.MAX_CUBE_MAP_TEXTURE_SIZE);
		Capabilities.maxRenderbufferSize = context.getParameter(context.MAX_RENDERBUFFER_SIZE);
		Capabilities.maxViewPortDims = context.getParameter(context.MAX_VIEWPORT_DIMS); // [x, y]
		Capabilities.maxAnisotropy = Capabilities.TextureFilterAnisotropic ? context.getParameter(Capabilities.TextureFilterAnisotropic.MAX_TEXTURE_MAX_ANISOTROPY_EXT) : 0;

		Capabilities.maxVertexTextureUnits = context.getParameter(context.MAX_VERTEX_TEXTURE_IMAGE_UNITS);
		Capabilities.maxFragmentTextureUnits = context.getParameter(context.MAX_TEXTURE_IMAGE_UNITS);
		Capabilities.maxCombinedTextureUnits = context.getParameter(context.MAX_COMBINED_TEXTURE_IMAGE_UNITS);

		Capabilities.maxVertexAttributes = context.getParameter(context.MAX_VERTEX_ATTRIBS);
		Capabilities.maxVertexUniformVectors = context.getParameter(context.MAX_VERTEX_UNIFORM_VECTORS);
		Capabilities.maxFragmentUniformVectors = context.getParameter(context.MAX_FRAGMENT_UNIFORM_VECTORS);
		Capabilities.maxVaryingVectors = context.getParameter(context.MAX_VARYING_VECTORS);

		Capabilities.aliasedPointSizeRange = context.getParameter(context.ALIASED_POINT_SIZE_RANGE); // [min, max]
		Capabilities.aliasedLineWidthRange = context.getParameter(context.ALIASED_LINE_WIDTH_RANGE); // [min, max]

		Capabilities.samples = context.getParameter(context.SAMPLES);
		Capabilities.sampleBuffers = context.getParameter(context.SAMPLE_BUFFERS);

		Capabilities.depthBits = context.getParameter(context.DEPTH_BITS);
		Capabilities.stencilBits = context.getParameter(context.STENCIL_BITS);
		Capabilities.subpixelBits = context.getParameter(context.SUBPIXEL_BITS);
		Capabilities.supportedExtensionsList = context.getSupportedExtensions();

		Capabilities.renderer = context.getParameter(context.RENDERER);
		Capabilities.vendor = context.getParameter(context.VENDOR);
		Capabilities.version = context.getParameter(context.VERSION);
		Capabilities.shadingLanguageVersion = context.getParameter(context.SHADING_LANGUAGE_VERSION);

		Capabilities.vertexShaderHighpFloat = context.getShaderPrecisionFormat(context.VERTEX_SHADER, context.HIGH_FLOAT);
		Capabilities.vertexShaderMediumpFloat = context.getShaderPrecisionFormat(context.VERTEX_SHADER, context.MEDIUM_FLOAT);
		Capabilities.vertexShaderLowpFloat = context.getShaderPrecisionFormat(context.VERTEX_SHADER, context.LOW_FLOAT);
		Capabilities.fragmentShaderHighpFloat = context.getShaderPrecisionFormat(context.FRAGMENT_SHADER, context.HIGH_FLOAT);
		Capabilities.fragmentShaderMediumpFloat = context.getShaderPrecisionFormat(context.FRAGMENT_SHADER, context.MEDIUM_FLOAT);
		Capabilities.fragmentShaderLowpFloat = context.getShaderPrecisionFormat(context.FRAGMENT_SHADER, context.LOW_FLOAT);

		Capabilities.vertexShaderHighpInt = context.getShaderPrecisionFormat(context.VERTEX_SHADER, context.HIGH_INT);
		Capabilities.vertexShaderMediumpInt = context.getShaderPrecisionFormat(context.VERTEX_SHADER, context.MEDIUM_INT);
		Capabilities.vertexShaderLowpInt = context.getShaderPrecisionFormat(context.VERTEX_SHADER, context.LOW_INT);
		Capabilities.fragmentShaderHighpInt = context.getShaderPrecisionFormat(context.FRAGMENT_SHADER, context.HIGH_INT);
		Capabilities.fragmentShaderMediumpInt = context.getShaderPrecisionFormat(context.FRAGMENT_SHADER, context.MEDIUM_INT);
		Capabilities.fragmentShaderLowpInt = context.getShaderPrecisionFormat(context.FRAGMENT_SHADER, context.LOW_INT);
	};

	/**
	 * Gets a string representation of the current capabilities
	 * @returns {string} string representation of capabilities
	 */
	Capabilities.getCapabilitiesString = function () {
		var caps = [];
		var isArrayBufferView = function(value) {
			return value && value.buffer instanceof ArrayBuffer && value.byteLength !== undefined;
		};
		for (var name in Capabilities) {
			var cap = Capabilities[name];
			if (cap instanceof Function || (typeof cap === 'object' && !(cap instanceof Array || isArrayBufferView(cap)))) {
				continue;
			}
			var str = '';
			if (isArrayBufferView(cap)) {
				str += '[';
				for (var i = 0; i < cap.length; i++) {
					str += cap[i];
					if (i < cap.length - 1) {
						str += ',';
					}
				}
				str += ']';
			} else {
				str = cap;
			}
			caps.push(name + ': ' + str);
		}
		return caps.join('\n');
	};

	return Capabilities;
});