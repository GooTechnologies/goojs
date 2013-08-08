define [
	'goo/loaders/handlers/ConfigHandler'
	
	'goo/renderer/MeshData'

	'goo/loaders/JsonUtils'
	'goo/util/PromiseUtil'
	'goo/util/ObjectUtil'
	
], (
ConfigHandler,
MeshData,
JsonUtils,
pu,
_) ->


	# Perhaps move to utils later
	_getTypedArray = (bindata, pointer)->
		[start, length, format] = pointer
		if format == 'float32'
			#new Float32Array(bindata, start, length) Inexplicably doesn't work
			new Float32Array(bindata.slice(start, start+length*4))
		else if format == 'uint8'
			#new Uint8Array(bindata, start, length)
			new Uint8Array(bindata.slice(start, start+length))
		else if format == 'uint16'
			#new Uint16Array(bindata, start, length)
			new Uint16Array(bindata.slice(start, start+length*2))
		else if format == 'uint32'
			#new Uint32Array(bindata, start, length)
			new Uint32Array(bindata.slice(start, start+length*4))
		else
			throw new Error("Binary format #{format} is not supported")



	class MeshDataHandler extends ConfigHandler
		@_register('mesh')
		BufferTypes = 
			PLAIN: 1
			COMPRESSED: 2
			BINARY: 3
	
		constructor: (@world, @getConfig, @updateObject, @options)->
			@_objects = {}
			@_binaryBuffers = {}

		_create: (meshConfig)->
			# We do everything in update instead			
			
		update: (ref, meshConfig)->
			@_binaryBuffers = {}

			if not @_objects[ref]
				# REVIEW: For consistency with typical JS/JSON capitalization and other configs,
				# binary_data should be called binaryDataRef
				if meshConfig.binary_data
					@getConfig(meshConfig.binary_data).then (bindata)=>
						if not bindata then throw new Error("Binary mesh data was empty")
						@_createMeshData(meshConfig, bindata)
						.then (meshData)=>
							@_objects[ref] = meshData
				else
					@_createMeshData(meshConfig, null)
					.then (meshData)=>
						@_objects[ref] = meshData
			else
				pu.createDummyPromise(@_objects[ref])

		remove: (ref)->
			# Do nothing, we didn't save anything
			

		# Returns promise that resolves with the created meshdata object
		_createMeshData: (meshConfig, bindata)->

			if meshConfig.compression and meshConfig.compression.compressed
				compression = 
					compressedVertsRange: meshConfig.compression.compressedVertsRange or (1 << 14) - 1 #int
					compressedColorsRange: meshConfig.compression.compressedColorsRange or (1 << 8) - 1 #int
					compressedUnitVectorRange: meshConfig.compression.compressedUnitVectorRange or (1 << 10) - 1 #int

			meshData = @_createMeshDataObject(meshConfig)
			@_fillMeshData(meshData, meshConfig, bindata, compression)

			if meshConfig.pose
				skelRef = meshConfig.pose
				@getConfig(skelRef).then (skelConfig)=>
					@updateObject(skelRef, skelConfig).then (skeleton)=>
						pose = new SkeletonPose(skeleton)
						pose.setToBindPose()
						meshData.currentPose = pose
						return meshData
			else
				pu.createDummyPromise(meshData)


		# Creates a MeshData object with the given config
		_createMeshDataObject: (config)->
			data = config.data or config
			if config.type == 'SkinnedMesh'
				weightsPerVert = 4
				type = MeshData.SKINMESH
			else
				weightsPerVert = 0
				type = MeshData.MESH

			
			vertexCount = data.vertexCount # int
			if vertexCount == 0 then return null
	
			indexCount = data.indexLengths?[0] or  data.indices?.length or 0
			
			attributeMap = {}
			if (data.vertices && data.vertices.length > 0)
				attributeMap.POSITION = MeshData.createAttribute(3, 'Float')
			
			if (data.normals && data.normals.length > 0)
				attributeMap.NORMAL = MeshData.createAttribute(3, 'Float')
			
			if (data.tangents && data.tangents.length > 0) 
				attributeMap.TANGENT = MeshData.createAttribute(4, 'Float')
			
			if (data.colors && data.colors.length > 0) 
				attributeMap.COLOR = MeshData.createAttribute(4, 'Float')
			
			if (weightsPerVert > 0 && data.weights) 
				attributeMap.WEIGHTS = MeshData.createAttribute(4, 'Float')
			
			if (weightsPerVert > 0 && data.joints) 
				attributeMap.JOINTIDS = MeshData.createAttribute(4, 'Short')
			
			if (data.textureCoords && data.textureCoords.length > 0)
				for texCoords, texIdx in data.textureCoords
					attributeMap['TEXCOORD' + texIdx] = MeshData.createAttribute(2, 'Float')

			#console.log "Parsing mesh @_data: #{_.keys(attributeMap).join(',')}"
				
			meshData = new MeshData(attributeMap, vertexCount, indexCount)
			meshData.type = type
			return meshData


		_fillMeshData: (meshData, config, bindata, compression)->
			data = config.data or config

			if meshData.type == MeshData.SKINMESH
				weightsPerVert = 4
			else
				weightsPerVert = 0

			@_fillAttributeBuffer(meshData, MeshData.POSITION, data.vertices, config, bindata, compression)
			@_fillAttributeBuffer(meshData, MeshData.NORMAL, data.normals, config, bindata, compression)
			@_fillAttributeBuffer(meshData, MeshData.TANGENT, data.tangents, config, bindata, compression)
			@_fillAttributeBuffer(meshData, MeshData.COLOR, data.colors, config, bindata, compression)
				
			if meshData.type == MeshData.SKINMESH
				@_fillAttributeBuffer(meshData, MeshData.WEIGHTS, data.weights, config, bindata, compression)

			if data.textureCoords?.length>0
				textureUnits = data.textureCoords
				for texObj, texIdx in textureUnits
					attr = 'TEXCOORD' + texIdx
					@_fillAttributeBuffer(meshData, attr, texObj.UVs or texObj, config, bindata, compression)	

	
			if weightsPerVert > 0 and data.joints?.length
				buffer = meshData.getAttributeBuffer(MeshData.JOINTIDS)
				jointData = @_getIntBuffer(data.joints, 32767, bindata, compression)
				
				if meshData.type == MeshData.SKINMESH
					# map these joints to local.
					localJointMap = [];
					localIndex = 0;
					for jointIndex, idx in jointData
						if localJointMap[jointIndex] == undefined
							localJointMap[jointIndex] = localIndex++
						buffer.set([localJointMap[jointIndex]], idx)
	
					# store local map
					localMap = [];
					for localIndex, jointIndex in localJointMap 
						localIndex = localJointMap[jointIndex]
						if localIndex != null
							localMap[localIndex] = jointIndex;
	
					meshData.paletteMap = localMap
					meshData.weightsPerVertex = weightsPerVert
				else
					for jointIdx in [0...jointData.capacity()]
						buffer.putCast(jointIdx, jointData.get(jointIdx))
					
			if data.indices
				meshData.getIndexBuffer().set(@_getIntBuffer(data.indices, data.vertexCount, bindata, compression))
	
			if data.indexModes then meshData.indexModes = data.indexModes[..]
			if data.indexLengths then meshData.indexLengths = data.indexLengths[..]
			if data.boundingBox then meshData.boundingBox = data.boundingBox
	
			return meshData


		_getIntBuffer: (data, len, bindata, compression) ->
			if not data
				null
			else if compression
				JsonUtils.getIntBufferFromCompressedString(data, len)
			else if bindata
				_getTypedArray(bindata, data)
			else
				JsonUtils.getIntBuffer(data, len)


		_fillAttributeBuffer: (meshData, attr, data, config, bindata, compression)->
			if data?.length
				if compression
					opts = @_getCompressionOptions(attr, config, compression)
					JsonUtils.fillAttributeBufferFromCompressedString(data, meshData, attr, opts.scale, opts.offset)
				else if bindata
					meshData.getAttributeBuffer(attr).set(_getTypedArray(bindata, data))
				else
					JsonUtils.fillAttributeBuffer(data, meshData, attr)			


		# Extract config for legacy compression format
		# returns an object with properties offset: [], scale: []
		_getCompressionOptions: (attr, config, compression)->
			data = config.data or config

			if attr == MeshData.POSITION
				offsetObj = data.vertexOffsets
				options = 
					offset:[
						offsetObj.xOffset, 
						offsetObj.yOffset, 
						offsetObj.zOffset
					]
					scale: [ 
						data.vertexScale,
						data.vertexScale, 
						data.vertexScale
					]
			
			else if attr == MeshData.WEIGHTS
				offset = 0
				scale = 1 / compression.compressedVertsRange
				options =  
					offset: [offset]
					scale: [scale]
			
			else if attr == MeshData.NORMAL
				offset = 1 - (compression.compressedUnitVectorRange + 1 >> 1)
				scale = 1 / -offset
				options =  
					offset: [offset, offset, offset]
					scale: [scale, scale, scale]

			else if attr == MeshData.TANGENT
				offset = 1 - (compression.compressedUnitVectorRange + 1 >> 1)
				scale = 1 / -offset
				options =  
					offset: [offset, offset, offset, offset]
					scale: [scale, scale, scale, scale]

			else if attr == MeshData.COLOR
				offset = 0
				scale = 1 / (compression.compressedColorsRange + 1)
				options =  
					offset: [offset, offset, offset, offset]
					scale: [scale, scale, scale, scale]

			else if attr.substr(0,8) == 'TEXCOORD'
				texIdx = parseInt(attr.substr(8))
				texObj = data.textureCoords[texIdx]
				options =
					offset: texObj.UVOffsets 
					scale: texObj.UVScales

		# Returns MeshData object
		# _parseMeshData: (data, weightsPerVert, type, compression)->
	
		# 	if data.vertices?.length > 0
		# 		if compression? 
		# 			offsetObj = data.vertexOffsets
		# 			JsonUtils.fillAttributeBufferFromCompressedString(
		# 				data.vertices, 
		# 				meshData, 
		# 				MeshData.POSITION, 
		# 		else if data.vertices instanceof Float32Array
		# 			meshData.getAttributeBuffer(MeshData.POSITION).set(data.vertices)
		# 		else 
		# 			JsonUtils.fillAttributeBuffer(data.vertices, meshData, MeshData.POSITION)
				
		# 	if weightsPerVert > 0 and data.weights
		# 		if compression?
		# 			offset = 0
		# 			scale = 1 / compression.compressedVertsRange
	
		# 			JsonUtils.fillAttributeBufferFromCompressedString(data.weights, meshData, MeshData.WEIGHTS, [scale], [offset])
		# 		else if data.weights instanceof Float32Array
		# 			meshData.getAttributeBuffer(MeshData.WEIGHTS).set(data.weights)
		# 		else
		# 			JsonUtils.fillAttributeBuffer(data.weights, meshData, MeshData.WEIGHTS)
				
		# 	if data.normals?.length>0
		# 		if compression?
		# 			offset = 1 - (compression.compressedUnitVectorRange + 1 >> 1)
		# 			scale = 1 / -offset
	
		# 			JsonUtils.fillAttributeBufferFromCompressedString(data.normals, meshData, MeshData.NORMAL, 
		# 				[scale, scale, scale], [offset, offset,offset])

		# 		else if data.normals instanceof Float32Array
		# 			meshData.getAttributeBuffer(MeshData.NORMAL).set(data.normals)
		# 		else
		# 			JsonUtils.fillAttributeBuffer(data.normals, meshData, MeshData.NORMAL)
	
		# 	if data.tangents?.length>0
		# 		if compression?
		# 			offset = 1 - (compression.compressedUnitVectorRange + 1 >> 1)
		# 			scale = 1 / -offset
	
		# 			JsonUtils.fillAttributeBufferFromCompressedString(data.tangents, meshData, MeshData.TANGENT, 
		# 				[scale, scale, scale, scale], [offset,offset, offset, offset])

		# 		else if data.tangents instanceof Float32Array
		# 			meshData.getAttributeBuffer(MeshData.TANGENTS).set(data.tangents)
		# 		else
		# 			JsonUtils.fillAttributeBuffer(data.tangents, meshData, MeshData.TANGENT)
	
		# 	if data.colors?.length>0
		# 		if compression?
		# 			offset = 0
		# 			scale = 1 / (compression.compressedColorsRange + 1)
		# 			JsonUtils.fillAttributeBufferFromCompressedString(data.colors, meshData, MeshData.COLOR, 
		# 				[scale, scale, scale, scale], [offset,offset, offset, offset])
		# 		else if data.colors instanceof Float32Array
		# 			meshData.getAttributeBuffer(MeshData.COLOR).set(data.colors)
		# 		else
		# 			JsonUtils.fillAttributeBuffer(data.colors, meshData, MeshData.COLOR)
	
		# 	if data.textureCoords?.length>0
		# 		textureUnits = data.textureCoords
		# 		if compression?
		# 			for texObj, texIdx in textureUnits
		# 				JsonUtils.fillAttributeBufferFromCompressedString(texObj.UVs, meshData, 'TEXCOORD' + texIdx, texObj.UVScales, texObj.UVOffsets)
		# 		else
		# 			for texObj, texIdx in textureUnits
		# 				attr = 'TEXCOORD' + texIdx
		# 				if @_binaryBuffers[attr] instanceof Float32Array
		# 					meshData.getAttributeBuffer(attr).set(@_)
		# 				else
		# 					JsonUtils.fillAttributeBuffer(texObj, meshData, attr)
	
		# 	if weightsPerVert > 0 and data.joints
		# 		buffer = meshData.getAttributeBuffer(MeshData.JOINTIDS)
	
		# 		if compression
		# 			jointData = JsonUtils.getIntBufferFromCompressedString(data.joints, 32767)
		# 		else if @_binaryBuffers.joints instanceof Uint16Array or @_binaryBuffers.joints instanceof Uint8Array
		# 			jointData = data.joints
		# 		else
		# 			jointData = JsonUtils.getIntBuffer(data.joints, 32767)
				
		# 		if type == 'SkinnedMesh'
		# 			# map these joints to local.
		# 			localJointMap = [];
		# 			localIndex = 0;
		# 			for jointIndex, idx in jointData
		# 				if localJointMap[jointIndex] == undefined
		# 					localJointMap[jointIndex] = localIndex++
	
		# 				buffer.set([localJointMap[jointIndex]], idx)
	
		# 			# store local map
		# 			localMap = [];
		# 			for localIndex, jointIndex in localJointMap 
		# 				localIndex = localJointMap[jointIndex]
		# 				if localIndex != null
		# 					localMap[localIndex] = jointIndex;
	
		# 			meshData.paletteMap = localMap
		# 			meshData.weightsPerVertex = weightsPerVert
		# 		else
		# 			for jointIdx in [0...jointData.capacity()]
		# 				buffer.putCast(jointIdx, jointData.get(jointIdx))
					
		# 	if data.indices
		# 		if compression?
		# 			meshData.getIndexBuffer().set(JsonUtils.getIntBufferFromCompressedString(data.indices, vertexCount))
		# 		else if @_binaryBuffers.indices instanceof Uint16Array or @_binaryBuffers.indices instanceof Uint8Array
		# 			meshData.getIndexBuffer().set(data.indices)

		# 		else					
		# 			meshData.getIndexBuffer().set(JsonUtils.getIntBuffer(data.indices, vertexCount))
	
		# 	if data.indexModes 
		# 		meshData.indexModes = data.indexModes[..]
					
		# 	if data.indexLengths
		# 		meshData.indexLengths = data.indexLengths[..]
	
		# 	if data.boundingBox
		# 		meshData.boundingBox = data.boundingBox
	
		# 	return meshData

