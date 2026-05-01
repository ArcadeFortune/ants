# Game structure & mechanics

Players have ants and hives Both are entities. Each have unique IDs and owner ID.

A Hive can contain a list of ant IDs, If an ant walks into a hive of the same owner, the Ant disappears from the map and gets added to the list of Ant IDs of the hive.

## Client

Using WASD, the user can select ants.

## Socket closing errors

- `4000` Server did not give ants to own player ID
