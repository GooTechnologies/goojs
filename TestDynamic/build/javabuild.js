// var requirejs = require('requirejs');

// var config = {
({
	baseUrl : '../WebContent',
	name : 'nes',
	out : 'main-built-java.js',
	useStrict : true,
	optimize : 'closure',
	uglify : {
		toplevel : false,
		ascii_only : false
	// beautify: true,
	// max_line_length: 120,

	// Custom value supported by r.js but done differently
	// in uglifyjs directly:
	// Skip the processor.ast_mangle() part of the uglify call (r.js 2.0.5+)
	// no_mangle: true
	},
	closure : {
		CompilerOptions : {},
		// CompilationLevel : 'SIMPLE_OPTIMIZATIONS',
		CompilationLevel : 'ADVANCED_OPTIMIZATIONS',
		loggingLevel : 'WARNING'
	}
// };
})

// requirejs.optimize(config, function(buildResponse) {
// buildResponse is just a text output of the modules
// included. Load the built file for the contents.
// Use config.out to get the optimized file contents.
// var contents = fs.readFileSync(config.out, 'utf8');
// });
