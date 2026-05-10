INSERT INTO `map` (`map_id`, `map_name`, `map_thumbnail`, `map_primary_color_R`, `map_primary_color_G`, `map_primary_color_B`) VALUES (1, 'Test Map', 'default/Test_Map_Thumbnail.png', 200,100,50);

INSERT INTO `region` (`region_id`, `region_name`, `region_type`, `region_parent_id`) VALUES (1, 'Top Left', 'Other', null);
INSERT INTO `region` (`region_id`, `region_name`, `region_type`, `region_parent_id`) VALUES (2, 'Top Right', 'Other', null);
INSERT INTO `region` (`region_id`, `region_name`, `region_type`, `region_parent_id`) VALUES (3, 'Bottom Left', 'Other', null);
INSERT INTO `region` (`region_id`, `region_name`, `region_type`, `region_parent_id`) VALUES (4, 'Bottom Right', 'Other', null);

INSERT INTO `polygon` (`polygon_id`, `polygon_region_id`, `polygon_points`) VALUES (1, 1, ST_GEOMFROMTEXT('POLYGON((0 0,10 0,10 10,0 10,0 0))'));
INSERT INTO `polygon` (`polygon_id`, `polygon_region_id`, `polygon_points`) VALUES (2, 1, ST_GEOMFROMTEXT('POLYGON((20 20,25 20,25 25,20 25,20 20))'));
INSERT INTO `polygon` (`polygon_id`, `polygon_region_id`, `polygon_points`) VALUES (3, 2, ST_GEOMFROMTEXT('POLYGON((0 0,10 0,10 10,0 10,0 0))'));
INSERT INTO `polygon` (`polygon_id`, `polygon_region_id`, `polygon_points`) VALUES (4, 2, ST_GEOMFROMTEXT('POLYGON((20 20,25 20,25 25,20 25,20 20))'));
INSERT INTO `polygon` (`polygon_id`, `polygon_region_id`, `polygon_points`) VALUES (5, 3, ST_GEOMFROMTEXT('POLYGON((0 0,10 0,10 10,0 10,0 0))'));
INSERT INTO `polygon` (`polygon_id`, `polygon_region_id`, `polygon_points`) VALUES (6, 3, ST_GEOMFROMTEXT('POLYGON((20 20,25 20,25 25,20 25,20 20))'));
INSERT INTO `polygon` (`polygon_id`, `polygon_region_id`, `polygon_points`) VALUES (7, 4, ST_GEOMFROMTEXT('POLYGON((0 0,10 0,10 10,0 10,0 0))'));
INSERT INTO `polygon` (`polygon_id`, `polygon_region_id`, `polygon_points`) VALUES (8, 4, ST_GEOMFROMTEXT('POLYGON((20 20,25 20,25 25,20 25,20 20))'));

INSERT INTO `mapRegion` (`mapRegion_map_id`, `mapRegion_Region_id`, `mapRegion_parent`, `mapRegion_offsetX`, `mapRegion_offsetY`, `mapRegion_scaleX`, `mapRegion_scaleY`) VALUES (0, 1, 'Left', 0, 0, 1.25, 0.75);
INSERT INTO `mapRegion` (`mapRegion_map_id`, `mapRegion_Region_id`, `mapRegion_parent`, `mapRegion_offsetX`, `mapRegion_offsetY`, `mapRegion_scaleX`, `mapRegion_scaleY`) VALUES (0, 2, 'Right', 10, 0, 1.25, 0.75);
INSERT INTO `mapRegion` (`mapRegion_map_id`, `mapRegion_Region_id`, `mapRegion_parent`, `mapRegion_offsetX`, `mapRegion_offsetY`, `mapRegion_scaleX`, `mapRegion_scaleY`) VALUES (0, 3, 'Left', 0, 10, 1.25, 0.75);
INSERT INTO `mapRegion` (`mapRegion_map_id`, `mapRegion_Region_id`, `mapRegion_parent`, `mapRegion_offsetX`, `mapRegion_offsetY`, `mapRegion_scaleX`, `mapRegion_scaleY`) VALUES (0, 4, 'Right', 10, 10, 1.25, 0.75);
