INSERT INTO `map` (`map_id`, `map_name`, `map_thumbnail`, `map_primary_color`) VALUES (0, 'Test Map', 'Test_Map_Thumbnail.png', '0,0,0');

INSERT INTO `shape` (`shape_id`, `shape_map_id`, `shape_name`, `shape_points`) VALUES (1, 0, 'topLeft', ST_GEOMFROMTEXT('MULTIPOLYGON(((0 0,100 0,100 100,0 100,0 0)))'));
INSERT INTO `shape` (`shape_id`, `shape_map_id`, `shape_name`, `shape_points`) VALUES (2, 0, 'topRight', ST_GEOMFROMTEXT('MULTIPOLYGON(((100 0,200 0,200 100,100 100,100 0)))'));
INSERT INTO `shape` (`shape_id`, `shape_map_id`, `shape_name`, `shape_points`) VALUES (3, 0, 'bottomLeft', ST_GEOMFROMTEXT('MULTIPOLYGON(((0 100,100 100,100 200,0 200,0 100)))'));
INSERT INTO `shape` (`shape_id`, `shape_map_id`, `shape_name`, `shape_points`) VALUES (4, 0, 'bottomRight', ST_GEOMFROMTEXT('MULTIPOLYGON(((100 100,200 100,200 200,100 200,100 100)))'));
