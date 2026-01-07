INSERT INTO `map` (`map_id`, `map_scale`, `map_name`, `map_thumbnail`, `map_primary_color_R`, `map_primary_color_G`, `map_primary_color_B`) VALUES (0, 15, 'Test Map', 'Test_Map_Thumbnail.png', 0,0,0);

INSERT INTO `region` (`region_id`, `region_name`, `region_parent_id`) VALUES (1, 'Top Left', null);
INSERT INTO `region` (`region_id`, `region_name`, `region_parent_id`) VALUES (2, 'Top Right', null);
INSERT INTO `region` (`region_id`, `region_name`, `region_parent_id`) VALUES (3, 'Bottom Left', null);
INSERT INTO `region` (`region_id`, `region_name`, `region_parent_id`) VALUES (4, 'Bottom Right', null);

INSERT INTO `polygon` (`polygon_id`, `polygon_region_id`, `polygon_is_enclave`, `polygon_enclave_of_region_id`, `polygon_points`) VALUES (2073, 1, false, null, ST_GEOMFROMTEXT('POLYGON((0 0,10 0,10 10,0 10,0 0))'));
INSERT INTO `polygon` (`polygon_id`, `polygon_region_id`, `polygon_is_enclave`, `polygon_enclave_of_region_id`, `polygon_points`) VALUES (2074, 1, false, null, ST_GEOMFROMTEXT('POLYGON((20 20,25 20,25 25,20 25,20 20))'));
INSERT INTO `polygon` (`polygon_id`, `polygon_region_id`, `polygon_is_enclave`, `polygon_enclave_of_region_id`, `polygon_points`) VALUES (2075, 2, false, null, ST_GEOMFROMTEXT('POLYGON((0 0,10 0,10 10,0 10,0 0))'));
INSERT INTO `polygon` (`polygon_id`, `polygon_region_id`, `polygon_is_enclave`, `polygon_enclave_of_region_id`, `polygon_points`) VALUES (2076, 2, false, null, ST_GEOMFROMTEXT('POLYGON((20 20,25 20,25 25,20 25,20 20))'));
INSERT INTO `polygon` (`polygon_id`, `polygon_region_id`, `polygon_is_enclave`, `polygon_enclave_of_region_id`, `polygon_points`) VALUES (2077, 3, false, null, ST_GEOMFROMTEXT('POLYGON((0 0,10 0,10 10,0 10,0 0))'));
INSERT INTO `polygon` (`polygon_id`, `polygon_region_id`, `polygon_is_enclave`, `polygon_enclave_of_region_id`, `polygon_points`) VALUES (2078, 3, false, null, ST_GEOMFROMTEXT('POLYGON((20 20,25 20,25 25,20 25,20 20))'));
INSERT INTO `polygon` (`polygon_id`, `polygon_region_id`, `polygon_is_enclave`, `polygon_enclave_of_region_id`, `polygon_points`) VALUES (2079, 4, false, null, ST_GEOMFROMTEXT('POLYGON((0 0,10 0,10 10,0 10,0 0))'));
INSERT INTO `polygon` (`polygon_id`, `polygon_region_id`, `polygon_is_enclave`, `polygon_enclave_of_region_id`, `polygon_points`) VALUES (2080, 4, false, null, ST_GEOMFROMTEXT('POLYGON((20 20,25 20,25 25,20 25,20 20))'));

INSERT INTO `mapRegion` (`mapRegion_map_id`, `mapRegion_Region_id`, `mapRegion_parent`, `mapRegion_offsetX`, `mapRegion_offsetY`, `mapRegion_scaleX`, `mapRegion_scaleY`) VALUES (0, 1, 'Left', 0, 0, 1.25, 0.75);
INSERT INTO `mapRegion` (`mapRegion_map_id`, `mapRegion_Region_id`, `mapRegion_parent`, `mapRegion_offsetX`, `mapRegion_offsetY`, `mapRegion_scaleX`, `mapRegion_scaleY`) VALUES (0, 2, 'Right', 10, 0, 1.25, 0.75);
INSERT INTO `mapRegion` (`mapRegion_map_id`, `mapRegion_Region_id`, `mapRegion_parent`, `mapRegion_offsetX`, `mapRegion_offsetY`, `mapRegion_scaleX`, `mapRegion_scaleY`) VALUES (0, 3, 'Left', 0, 10, 1.25, 0.75);
INSERT INTO `mapRegion` (`mapRegion_map_id`, `mapRegion_Region_id`, `mapRegion_parent`, `mapRegion_offsetX`, `mapRegion_offsetY`, `mapRegion_scaleX`, `mapRegion_scaleY`) VALUES (0, 4, 'Right', 10, 10, 1.25, 0.75);
