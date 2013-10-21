define( [],
	function() {
		"use strict";

		var typesAndValues;
		var typesAndValuesStack = [];

		function ProcessArguments( target, args, callback ) {
			if( typesAndValues !== undefined ) {
				typesAndValuesStack.push( typesAndValues );
			}
			typesAndValues = { types: [], values: [] };

			var types  = typesAndValues.types;
			var values = typesAndValues.values;

			recurseArguments( args, types, values );

			var t, tl = types.length;
			for( t = 0; t < tl; t++ ) {
				callback( target, types[ t ], values[ t ] );
			}

			if( typesAndValuesStack.length ) {
				typesAndValues = typesAndValuesStack.pop();
			}
		}

		ProcessArguments.STRING      = "string",
		ProcessArguments.TAG         = "tag",
		ProcessArguments.ATTRIBUTE   = "attribute",
		ProcessArguments.CONSTRUCTOR = "constructor",
		ProcessArguments.INSTANCE    = "instance",
		ProcessArguments.PARAMETERS  = "parameters"

		function recurseArguments( args, types, values ) {
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
									types.push( ProcessArguments.PARAMETERS );
								} else {
									types.push( ProcessArguments.INSTANCE );
								}
							}
						} else if( type === "string" ) {
							if( arg.indexOf( "#" ) === 0 ) {
								types.push( ProcessArguments.TAG );
							} else if( arg.indexOf( "@" ) === 0 ) {
								types.push( ProcessArguments.ATTRIBUTE );
							} else {
								types.push( ProcessArguments.STRING );
							}
						} else if( type === "function" ) {
							types.push( ProcessArguments.CONSTRUCTOR );
						}
					}
				}
			}
		}

		return ProcessArguments;
	}
)