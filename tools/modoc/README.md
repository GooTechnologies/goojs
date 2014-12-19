modoc
=====

Documentation extractor and renderer.

**Disclaimer:**<br>
Modoc does not support (nor does it need to) the full set of tags - see a list of supported tags and annotations below.<br>
Modoc does not come with any guarantee that it will run well on anything else than goojs. Modoc works well by making assumptions about the structure of the code - goojs code.

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

###Writing jsdoc

The jsdoc extractor (*extractor.js*) can figure out what the constructor of a class is by searching for a function with the same name as the file name. It sound very specific but 99% of engine classes match this criteria (the exception is *SystemBus* which will have to be documented with `@target-class`). 
 
The extractor can figure out what members do instances of classes have by looking for assignments to `this` in the constructor of a class.

Methods, static methods and static members are also detectable by looking for assignments to the prototype of the class or to the constructor itself. Members and static members are not extracted unless they are accompanied by a jsdoc comment. Methods and static methods are extracted default (even if and accompanying jsdoc comment is missing). Items whose names begin with an `_` are filtered out and so are items with an `@private` or an `@hidden`.

If you wish to document anything that is not covered by either of these cases you can just place a jsdoc comment (block, starting with a `*`) that contains an `@target-class` anywhere (in any file). 

###Supported tags/transformations

 + `@param {<type>} <name> <description>` - any known classes mentioned in *type* are transformed in links
 + `@example` followed by any number of lines of code
 + `@returns {<type>} <description>`
 + `@deprecated <description>` - deprecated items are collected in a list and rendered in a special place
 + `@hidden` to exclude a method from rendering
 + `@private` same as `@hidden` and to communicate that this method should not be used from outside of its class
 + `@type {<type>}` for documenting the type of members of `this` in a constructor
 + `@default <value>` for documenting the default value of members of `this` in a constructor
 + `@property` same effect as `@type`, only that it appears in the constructor's jsdoc
 + `@readonly` to inform the user that this property should not be modified
 + `@extends <base-class>`
 + `@example-link <link> <text>` to link to a jsfiddle or a visual-test
 + `@target-class <target-class> <item-name> method|member|static-method|static-member` to document fictitious items. 
 + `[text]{@link url}` will generate a link for *text* pointing to *url*. This can stay in any *description* field.
 + `(!)` adds a yellow-warning-triangle

###Tags/transformations under consideration

 + `@signature` to allow for multiple signatures
 + `@include file` to include lengthy descriptions stored in other files

###Uses 

 + *esprima* to parse the javascript code holding the docs
 + a custom extractor to retrieve relevant data: comments and signatures for constructors, instance methods, 
members, etc.
 + *dogma*, our in-house jsdoc parser (*doctrine* does not suit us perfectly)
 + *mustache* to render the doc
 + *highlight.js* for syntax highlighting of examples