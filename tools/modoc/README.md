modoc
=====

Documentation extractor and renderer.

It does not support (nor does it need to) the full set of tags - see a list of supported tags and annonations below.

###Setup

`npm install`

Manually copy [esprima.js](https://raw.githubusercontent.com/ariya/esprima/master/esprima.js) into 
*node_modules/esprima/esprima.js* 

###Usage

`node src/modoc.js <sourcesPath> <templatesPath> <staticsPath> <outPath>`

Where 

 + *sourcesPath* points to the engine or any other source rich in jsdoc
 + *templatesPath* points to the folder storing the templates used to generate doc pages
 + *staticsPath* points to where the styles and additional scripts are located - these files will just be copied over 
to the *outPath* directory
 + *outPath* points to where the result should be stored

**Ex:** `node tools/modoc/src/modoc.js src/goo tools/modoc/src/templates tools/modoc/src/statics out-doc` if called from the base *goojs* directory

###Supported tags/transformations:

+ `@param {type} name description...` - any known classes mentioned in *type* are transformed in links
+ `@example` followed by any number of lines of code
+ `@return` and `@returns`; one of them will be removed after the doc is normalised
+ `@deprecated` - deprecated items are collected in a list and rendered in a special place
+ `@hidden` to exclude a method from rendering
+ `@private` same as `@hidden` and to communicate that this method should not be used from outside of its class
+ `@type` for documenting the type of members of `this` in a constructor
+ `@default` for documenting the default value of members of `this` in a constructor
+ `@property` same effect as `@type`, only that it appears in the constructor's jsdoc
+ `@readonly` to inform the user that this property should not be modified
+ `@extends`
+ `@example-link` to link to a jsfiddle or a visual-test
+ `[text]{@link url}` will generate a link for *text* pointing to *url*. This can stay in any *description* field.
+ `{@linkplain url text}` same as above; will be removed once the doc is normalised

###Tags/transformations under consideration:

+ `@signature` to allow for multiple signatures
+ `@include file` to include lengthy descriptions stored in other files

###Uses 

+ *esprima* to parse the javascript code holding the docs
+ a custom extractor to retrieve relevant data: comments and signatures for constructors, instance methods, 
members, etc.
+ *dogma*, our in-house jsdoc parser (*doctrine* does not suit us perfectly)
+ *mustache* to render the doc
+ *highlight.js* for syntax highlighting of examples