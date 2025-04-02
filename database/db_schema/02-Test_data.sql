INSERT INTO `map` (`map_id`, `map_scale`, `map_name`, `map_thumbnail`, `map_primary_color`) VALUES (0, 15, 'Test Map', 'Test_Map_Thumbnail.png', '0,0,0');

INSERT INTO `Region` (`Region_id`, `Region_name`, `Region_points`) VALUES (1, 'Top Left', ST_GEOMFROMTEXT('MULTIPOLYGON(((0 0, 10 0, 10 10, 0 10, 0 0)),((20 20, 25 20, 25 25, 20 25, 20 20)))'));
INSERT INTO `Region` (`Region_id`, `Region_name`, `Region_points`) VALUES (2, 'Top Right', ST_GEOMFROMTEXT('MULTIPOLYGON(((0 0, 10 0, 10 10, 0 10, 0 0)),((20 20, 25 20, 25 25, 20 25, 20 20)))'));
INSERT INTO `Region` (`Region_id`, `Region_name`, `Region_points`) VALUES (3, 'Bottom Left', ST_GEOMFROMTEXT('MULTIPOLYGON(((0 0, 10 0, 10 10, 0 10, 0 0)),((20 20, 25 20, 25 25, 20 25, 20 20)))'));
INSERT INTO `Region` (`Region_id`, `Region_name`, `Region_points`) VALUES (4, 'Bottom Right', ST_GEOMFROMTEXT('MULTIPOLYGON(((0 0, 10 0, 10 10, 0 10, 0 0)),((20 20, 25 20, 25 25, 20 25, 20 20)))'));

INSERT INTO `mapRegion` (`mapRegion_map_id`, `mapRegion_Region_id`, `mapRegion_offsetX`, `mapRegion_offsetY`, `mapRegion_scaleX`, `mapRegion_scaleY`) VALUES (0, 1, 0, 0, 1.25, 0.75);
INSERT INTO `mapRegion` (`mapRegion_map_id`, `mapRegion_Region_id`, `mapRegion_offsetX`, `mapRegion_offsetY`, `mapRegion_scaleX`, `mapRegion_scaleY`) VALUES (0, 2, 10, 0, 1.25, 0.75);
INSERT INTO `mapRegion` (`mapRegion_map_id`, `mapRegion_Region_id`, `mapRegion_offsetX`, `mapRegion_offsetY`, `mapRegion_scaleX`, `mapRegion_scaleY`) VALUES (0, 3, 0, 10, 1.25, 0.75);
INSERT INTO `mapRegion` (`mapRegion_map_id`, `mapRegion_Region_id`, `mapRegion_offsetX`, `mapRegion_offsetY`, `mapRegion_scaleX`, `mapRegion_scaleY`) VALUES (0, 4, 10, 10, 1.25, 0.75);