INSERT INTO `map` (`map_id`, `map_scale`, `map_name`, `map_thumbnail`, `map_primary_color`) VALUES (0, 25, 'Test Map', 'Test_Map_Thumbnail.png', '0,0,0');

INSERT INTO `shape` (`shape_id`, `shape_map_id`, `shape_name`, `shape_points`) VALUES (1, 0, 'Top Left', ST_GEOMFROMTEXT('MULTIPOLYGON(((0 0, 10 0, 10 10, 0 10, 0 0)),((20 20, 25 20, 25 25, 20 25, 20 20)))'));
INSERT INTO `shape` (`shape_id`, `shape_map_id`, `shape_name`, `shape_points`) VALUES (2, 0, 'Top Right', ST_GEOMFROMTEXT('MULTIPOLYGON(((0 0, 10 0, 10 10, 0 10, 0 0)),((20 20, 25 20, 25 25, 20 25, 20 20)))'));
INSERT INTO `shape` (`shape_id`, `shape_map_id`, `shape_name`, `shape_points`) VALUES (3, 0, 'Bottom Left', ST_GEOMFROMTEXT('MULTIPOLYGON(((0 0, 10 0, 10 10, 0 10, 0 0)),((20 20, 25 20, 25 25, 20 25, 20 20)))'));
INSERT INTO `shape` (`shape_id`, `shape_map_id`, `shape_name`, `shape_points`) VALUES (4, 0, 'Bottom Right', ST_GEOMFROMTEXT('MULTIPOLYGON(((0 0, 10 0, 10 10, 0 10, 0 0)),((20 20, 25 20, 25 25, 20 25, 20 20)))'));

INSERT INTO `shapeOffset` (`shapeOffset_map_id`, `shapeOffset_shape_id`, `shapeOffset_X`, `shapeOffset_Y`) VALUES (0, 1, 0, 0);
INSERT INTO `shapeOffset` (`shapeOffset_map_id`, `shapeOffset_shape_id`, `shapeOffset_X`, `shapeOffset_Y`) VALUES (0, 2, 100, 0);
INSERT INTO `shapeOffset` (`shapeOffset_map_id`, `shapeOffset_shape_id`, `shapeOffset_X`, `shapeOffset_Y`) VALUES (0, 3, 0, 100);
INSERT INTO `shapeOffset` (`shapeOffset_map_id`, `shapeOffset_shape_id`, `shapeOffset_X`, `shapeOffset_Y`) VALUES (0, 4, 100, 100);