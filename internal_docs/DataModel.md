# TODO: Rewrite into actual markdown

# Data model
Principles
- Key Value
- Key is globally unique
- Key should not be based on user input
- Key contains type identifier
- Key is not explicitly tied to project/user

Terminology
- Key=ref=id
- JSON object = Config


- Binaries
 - Immutable
 - Potentially stored in S3, or sliced
 - Keys for binaries are/contain a hash of the content
  - Salt hash with user specific data to avoid malicious intentional cache collisions
   - Deduplication across users is not a driver
 - Access control through metadata
  - Store user list or public flag in binary resource's metadata


- JSON
 - Mutable
 - Key is generated, not necessarily readable
 - All objects have a name property (use within engine) (readable)
 ? An object is a potentially reusable resource
  - E.g. texture, potentially reusable, materialComponent, not reusable, tied to an entity
  - A skybox should be a separate object
  - Post effects?

 - Access control
  - Front end needs to know edit/read
  - Store in JSON or in metadata (Jon Research)
   - JSON: data is naturally transferred to the front end
   - Metadata: Backend can do a HEAD request to check access on write

 - Levels
  ? User Asset Library
  - Project
   - project asset library (NB: Not all the objects in all the scenes just the prefabized ones)
   - scenes
   - metadata (description, screenshot, author, etc.)
  - Scene
   - Global config (environment, post effects, etc.)
   - entities



 - Merge-safe (bitsquid)
  - No arrays (objects with sort values)
 
 - Dependencies
  - It must be possible to somehow get all the dependencies of a given object
   - Research (ask Basho)
    - Drivers: 
     - Performance
     - Robustness

   ? Manual indices (libraryRefs)
   ? Link walking
   ? Map reduce

  - All objects should reference their direct dependencies
   - Entities should reference their children, not their parent (parent is not a dependency)

  - All refs keys in the JSON should be easily identifiable
   ? End with Ref (single ref) or Refs (array-like of refs)
   - Binaries too (no more url)
 
 - Prefabs, selective override
  - When I use an object in my scene, a minimal linked object is created: 
  {
    id: "[localHouseID].entity",
    sourceRef: "[originalHouseID].entity"
  }
  where [localHouseID] and [originalHouseID] are GUIDs
  When the editor loads [localHousID], it reads originalHouseID and merges the two files
  before the data is loaded into the engine. This merge is done in the engine loaders/handlers. 

  I change the position of my house, and voila!
  {
    id: "[localHouseID].entity",
    sourceRef: "[originalHouseID].entity",
    ...
    transform: [x,x,x]
  }

  When loading a bundle, the dependency walker must load originalHouse if localHouse is in my scene, 
  hence the key is sourceRef.

  I can manually sever the link in the editor. The data from originalHouse will be copied to localHouse, 
  but future changes to originalHouse will not be reflected in localHouse. 

  If my level designer team mate wants to use my house in a level, he can insert it in his scene. This 
  will create a new object newLocalHouse with a link to my localHouse. Both my changes and changes to 
  originalHouse will be reflected in newLocalHouse. 

  If I want to sell/share my new improved localHouse on the asset market, all links are severed. Assets
  in the global asset library cannot have links. 

  Assets in the asset library are "immutable". Publishing local assets to an asset library copies
  the local asset, with dependencies, severs all the links and creates a version of the asset in the 
  asset library. If it's published anew, a new version of the same asset is created. Users can 
  potentially subscribe to new versions of originalHouse, and get notifications or similar. 

 - Merging new converted fbx
  - I convert an fbx, that contains 4 entities, 1,2,3,4 with names A,B,C,D
  - Overrides are created for all 4 entities
  - I drop a new version of the fbx and somehow indicate that I want to replace/merge
  - It creates 4 new entities 5,6,7,8 with names A,B,C,E
  - The editor matches A,B,C and overwrites enties 1,2,3 with the data in 5,6,7
  - The editor adds entity 8 (E) to the project and discards 5,6,7
  - An override is created for 8 (E)
  - 4 (D) has no more links and is removed, either explicitly or by "the broom"
  - The overrides still point to 1,2,3

