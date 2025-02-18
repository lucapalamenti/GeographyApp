INSERT INTO `map` (`map_id`, `map_name`, `map_thumbnail`, `map_primary_color`) VALUES (0, 'Test Map', 'Test_Map_Thumbnail.png', '0,0,0');

INSERT INTO `shape` (`shape_map_id`, `shape_name`, `shape_points`) VALUES (0, 'Top Right', ST_GEOMFROMTEXT('MULTIPOLYGON(((300 100,500 100,500 300,300 300,300 100)))'));
INSERT INTO `shape` (`shape_map_id`, `shape_name`, `shape_points`) VALUES (0, 'Top Left', ST_GEOMFROMTEXT('MULTIPOLYGON(((100 100,300 100,300 300,100 300,100 100)))'));
INSERT INTO `shape` (`shape_map_id`, `shape_name`, `shape_points`) VALUES (0, 'Bottom Left', ST_GEOMFROMTEXT('MULTIPOLYGON(((100 300,300 300,300 500,100 500,100 300)))'));
INSERT INTO `shape` (`shape_map_id`, `shape_name`, `shape_points`) VALUES (0, 'Bottom Right', ST_GEOMFROMTEXT('MULTIPOLYGON(((300 300,500 300,500 500,300 500,300 300)))'));
