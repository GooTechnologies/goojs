import json
from jsonschema import validate, RefResolver
from jsonschema.exceptions import RefResolutionError, ValidationError



class MyResolver(RefResolver):
	"""
	Hacks the resolver to check the schema root and resolve any flat refs to 
	the types defined there.
	"""
	def resolve_remote(self, uri):
		if uri in self.store[""]:
			return self.store[""][uri]
		else:
			raise RefResolutionError("Unable to find type %s"%uri)


with open('project-example.json') as f: 
	jsondata = json.load(f)

with open('project-schema.json') as f:
	schema = json.load(f)

try: 
	validate(jsondata, schema['Project'], resolver=MyResolver.from_schema(schema))
except ValidationError as ve:
	print "Validation Failed: %s"%ve.message