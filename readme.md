# Game structure & mechanics

Players have ants and hives Both are entities. Each have unique IDs and owner ID.

A Hive can contain a list of ant IDs, If an ant walks into a hive of the same owner, the Ant disappears from the map and gets added to the list of Ant IDs of the hive.

## Vision

Upon change of entity position, tiles in a radius are scanned to be sent to the player of that entity.

If an entity of another player is found withing vision, the players own id is stored in `inVisionTo[]` inside the entity.

Movement of that entity will be also sent to all players in its `inVisionTo[]` list.
il
## Client

Using WASD, the user can select ants.

## Socket closing errors

- `4000` Server did not give ants to own player ID
