Shader-bits
===========

###What's a shader bit?
It's a template of a pure function that can return multiple values. Once instantiated the outputs can be connected to other shader bits' inputs.

###Template?
The body of a shader-bit is written in GLSL that goes through a preprocessor. The preprocessor interprets the content of GLSL comments as JavaScript and the GLSL code as strings.

If, for example, the shader bit `value = input * /*data.times*/;` is instantiated with `{ times: 3 }` the preprocessor is going to output `value = input * 3.0;`. Type conversions are handled automatically (`3` is translated to `3.0` and `[1, 2, 3]` is translated to `vec3(1.0, 2.0, 3.0)`).

Consider another example:

```
	float original = value;
	/*for (var i = 0; i < data.times; i++) {*/
		value += original;
	/*}*/
```

This shader bit has the same effect as the previous one except the source code is different. When it is instatiated with `{ times: 3 }` the code will expand to

```
	float original = value;
	value += original;
	value += original;
	value += original;
```

For a more complex example check out the template demo *demos/template*.

###Are there any samples?

+ *demos/api/sample1/2* show how to use the programmatic api
+ *demos/node-graph* show how to use the graph editor