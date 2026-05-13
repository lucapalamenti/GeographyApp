INSERT INTO `map` (`map_id`, `map_name`, `map_thumbnail`, `map_primary_color_R`, `map_primary_color_G`, `map_primary_color_B`, `map_is_template`) VALUES
(1, 'Test Map', 'default/Test_Map_Thumbnail.png', 200, 100, 50, 1);

INSERT INTO `region` (`region_id`, `region_name`, `region_type`, `region_points`) VALUES
(1, 'Point A', 'Test Geometry', ST_GEOMFROMTEXT('POINT(0 0)')),
(2, 'MultiPoint A', 'Test Geometry', ST_GEOMFROMTEXT('MULTIPOINT(10 0)')),
(3, 'MultiPoint B', 'Test Geometry', ST_GEOMFROMTEXT('MULTIPOINT(15 0,15 5,15 10)')),
(4, 'LineString A', 'Test Geometry', ST_GEOMFROMTEXT('LINESTRING(45 0)')),
(5, 'LineString B', 'Test Geometry', ST_GEOMFROMTEXT('LINESTRING(25 0,30 5,25 10)')),
(6, 'LineString C', 'Test Geometry', ST_GEOMFROMTEXT('LINESTRING(35 0,40 0,40 5,35 5,35 0)')),
(7, 'MultiLineString A', 'Test Geometry', ST_GEOMFROMTEXT('MULTILINESTRING((50 0))')),
(8, 'MultiLineString B', 'Test Geometry', ST_GEOMFROMTEXT('MULTILINESTRING((60 0,60 5),(60 15))')),
(9, 'MultiLineString C', 'Test Geometry', ST_GEOMFROMTEXT('MULTILINESTRING((70 0,75 0,75 5,70 5,70 0),(70 15,75 15),(70 25))')),
(10, 'Polygon A', 'Test Geometry', ST_GEOMFROMTEXT('POLYGON((80 0,85 0,85 5,80 5,80 0))')),
(11, 'Polygon B', 'Test Geometry', ST_GEOMFROMTEXT('POLYGON((100 0,115 0,115 15,100 15,100 0),(105 5,105 10,110 10,110 5,105 5))')),
(12, 'Polygon C', 'Test Geometry', ST_GEOMFROMTEXT('POLYGON((170 0,195 0,195 25,170 25,170 0),(175 5,175 20,190 20,190 5,175 5),(180 10,185 10,185 15,180 15,180 10))')),
(13, 'MultiPolygon A', 'Test Geometry', ST_GEOMFROMTEXT('MULTIPOLYGON(((120 0,125 0,125 5,120 5,120 0)))')),
(14, 'MultiPolygon B', 'Test Geometry', ST_GEOMFROMTEXT('MULTIPOLYGON(((130 0,145 0,145 15,130 15,130 0),(135 5,135 10,140 10,140 5,135 5)))')),
(15, 'MultiPolygon C', 'Test Geometry', ST_GEOMFROMTEXT('MULTIPOLYGON(((150 0,165 0,165 15,150 15,150 0),(155 5,155 10,160 10,160 5,155 5)),((150 25,160 25,160 35,150 35,150 25)))'));

INSERT INTO `mapRegion` (`mapRegion_map_id`, `mapRegion_Region_id`, `mapRegion_parent`, `mapRegion_offsetX`, `mapRegion_offsetY`, `mapRegion_scaleX`, `mapRegion_scaleY`) VALUES
(1, 1, 'Point', 0, 0, 1, 1),
(1, 2, 'MultiPoint', 0, 0, 1, 1),
(1, 3, 'MultiPoint', 0, 0, 1, 1),
(1, 4, 'LineString', 0, 0, 1, 1),
(1, 5, 'LineString', 0, 0, 1, 1),
(1, 6, 'LineString', 0, 0, 1, 1),
(1, 7, 'MultiLineString', 0, 0, 1, 1),
(1, 8, 'MultiLineString', 0, 0, 1, 1),
(1, 9, 'MultiLineString', 0, 0, 1, 1),
(1, 10, 'Polygon', 0, 0, 1, 1),
(1, 11, 'Polygon', 0, 0, 1, 1),
(1, 12, 'Polygon', 0, 0, 1, 1),
(1, 13, 'MultiPolygon', 0, 0, 1, 1),
(1, 14, 'MultiPolygon', 0, 0, 1, 1),
(1, 15, 'MultiPolygon', 0, 0, 1, 1);