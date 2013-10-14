define( [],
	function() {
		"use strict";

		var types  = [];
		var values = [];

		function process( target, args, callback ) {
			types .length = 0;
			values.length = 0;

			recurseArguments( args );

			var t, tl = types.length;
			for( t = 0; t < tl; t++ ) {
				callback( target, types[ t ], values[ t ] );
			}
		}

		process.STRING      = "string",
		process.TAG         = "tag",
		process.ATTRIBUTE   = "attribute",
		process.CONSTRUCTOR = "constructor",
		process.INSTANCE    = "instance",
		process.PARAMETERS  = "parameters"

		function recurseArguments( args ) {
			if( args !== undefined ) {
				var arg, a, al = args.length;
				var type;

				for( a = 0; a < al; a++ ) {
					arg = args[ a ];

					if( arg !== undefined ) {
						values.push( arg );

						type = typeof( arg );
						if( type === "object" ) {
							if( Array.isArray( arg )) {
								recurseArguments.apply( this, args );
							} else {
								if( arg.constructor.toString().indexOf( "function Object()" ) === 0 ) {
									types.push( process.PARAMETERS );
								} else {
									types.push( process.INSTANCE );
								}
							}
						} else if( type === "string" ) {
							if( arg.indexOf( "#" ) === 0 ) {
								types.push( process.TAG );
							} else if( arg.indexOf( "@" ) === 0 ) {
								types.push( process.ATTRIBUTE );
							} else {
								types.push( process.STRING );
							}
						} else if( type === "function" ) {
							types.push( process.CONSTRUCTOR );
						}
					}
				}
			}
		}

		return process;
	}
)