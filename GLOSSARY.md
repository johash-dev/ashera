# Glossary

Vocabulary only — one line per term. Use these words in code, docs and conversation. Add terms when they are agreed (the `/grill` skill does this).

| Term                    | Meaning                                                                                                                                     |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| **Room**                | The physical gaming room and its measured model (`Room` type). There is exactly one.                                                        |
| **Twin**                | The 3D digital representation of the Room shown in the app.                                                                                 |
| **Wall**                | One of four interior walls, named by compass direction: north, east, south, west.                                                           |
| **Window wall**         | The west wall.                                                                                                                              |
| **TV wall**             | The north wall — the one you face when entering.                                                                                            |
| **Door wall**           | The south wall, containing the doorway.                                                                                                     |
| **Opening**             | A hole in a wall: a doorway or a window.                                                                                                    |
| **Doorway**             | The opening you walk through, measured inside its frame. The **Door** is the leaf that fills it and swings into the room.                   |
| **Door swing**          | The floor area the door sweeps when opening; must stay clear of Items.                                                                      |
| **Beam**                | Structural drop along the top of a wall, below the ceiling.                                                                                 |
| **Clear height**        | Height available under a Wall's Beam (or the ceiling if it has none).                                                                       |
| **Skirting**            | Dark trim along the bottom of every wall; its depth is how far it stands off the wall face.                                                 |
| **Fitting**             | A fixed electrical point in the Room: socket, switch plate, data plate or ceiling light.                                                    |
| **Cutaway**             | Hiding the Walls and ceiling that face an outside camera, so the Room's inside stays visible.                                               |
| **View**                | A preset camera position (overview, top, or a reference-photo standpoint), picked with a Header button or `?view=`.                         |
| **Item**                | A placeable piece of furniture or equipment in the Twin (Phase 2).                                                                          |
| **Facing**              | The compass direction an Item's front points; an Item facing east or west runs its width north–south.                                       |
| **Catalog**             | The set of Item types Asher can place (Phase 2).                                                                                            |
| **Floor covering**      | An Item (the rug) that lies on the floor and that other Items may stand on, so it never counts as overlapping them.                         |
| **Starter arrangement** | The fixed Items of the Room (TV wall, desk and its setup, chair, sofa, rug), placed from the Room and the Catalog until Items can be moved. |
| **Slat panel**          | Black vertical wooden slats covering the TV wall, with cut-outs for its Fittings.                                                           |
| **Layout**              | A named arrangement of Items in the Room; saved and loaded as a whole (Phase 2).                                                            |
| **Placeholder**         | A measurement that is an estimate until really measured (`placeholder: true`).                                                              |
| **Device**              | A real smart device (light, plug, sensor) linked to the Twin (Phase 4).                                                                     |
| **Owner**               | The developer maintaining ASHERA (not Asher, who is the user).                                                                              |
