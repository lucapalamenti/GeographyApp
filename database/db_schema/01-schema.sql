-- --------------------------------------------------------
-- Host:                         localhost
-- Server version:               11.6.2-MariaDB-ubu2404 - mariadb.org binary distribution
-- Server OS:                    debian-linux-gnu
-- HeidiSQL Version:             12.10.0.7000
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Dumping database structure for geographyapp
CREATE DATABASE IF NOT EXISTS `geographyapp` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci */;
USE `geographyapp`;

-- Dumping structure for table geographyapp.map
CREATE TABLE IF NOT EXISTS `map` (
  `map_id` int(10) NOT NULL,
  `map_scale` decimal(10,6) NOT NULL DEFAULT 1.000000,
  `map_name` varchar(100) NOT NULL DEFAULT '',
  `map_thumbnail` tinytext DEFAULT '',
  `map_primary_color` varchar(31) NOT NULL DEFAULT '255,255,255',
  PRIMARY KEY (`map_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Data exporting was unselected.

-- Dumping structure for table geographyapp.region
CREATE TABLE IF NOT EXISTS `region` (
  `region_id` int(10) NOT NULL AUTO_INCREMENT,
  `region_name` tinytext NOT NULL,
  `region_points` multipolygon NOT NULL,
  PRIMARY KEY (`region_id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=103 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Data exporting was unselected.

-- Dumping structure for table geographyapp.mapRegion
CREATE TABLE IF NOT EXISTS `mapRegion` (
  `mapRegion_id` int(10) NOT NULL AUTO_INCREMENT,
  `mapRegion_map_id` int(10) NOT NULL DEFAULT 0,
  `mapRegion_region_id` int(10) NOT NULL DEFAULT 0,
  `mapRegion_parent` varchar(64) NOT NULL DEFAULT 'Earth',
  `mapRegion_offsetX` decimal(10,6) NOT NULL DEFAULT 0.000000,
  `mapRegion_offsetY` decimal(10,6) NOT NULL DEFAULT 0.000000,
  `mapRegion_scaleX` decimal(10,6) NOT NULL DEFAULT 0.000000,
  `mapRegion_scaleY` decimal(10,6) NOT NULL DEFAULT 0.000000,
  PRIMARY KEY (`mapRegion_id`) USING BTREE,
  KEY `FK_mapRegion_map` (`mapRegion_map_id`) USING BTREE,
  KEY `FK_mapRegion_region` (`mapRegion_region_id`) USING BTREE,
  CONSTRAINT `FK_mapRegion_map` FOREIGN KEY (`mapRegion_map_id`) REFERENCES `map` (`map_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_mapRegion_region` FOREIGN KEY (`mapRegion_region_id`) REFERENCES `region` (`region_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=103 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Data exporting was unselected.

-- Dumping structure for table geographyapp.surroundings
CREATE TABLE IF NOT EXISTS `surroundings` (
  `surroundings_id` int(10) NOT NULL AUTO_INCREMENT,
  `surroundings_map_id` int(10) NOT NULL DEFAULT 0,
  `surroundings_other_id` int(10) NOT NULL DEFAULT 0,
  PRIMARY KEY (`surroundings_id`),
  KEY `FK_surroundings_map` (`surroundings_map_id`),
  KEY `FK_surroundings_map_2` (`surroundings_other_id`),
  CONSTRAINT `FK_surroundings_map` FOREIGN KEY (`surroundings_map_id`) REFERENCES `map` (`map_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_surroundings_map_2` FOREIGN KEY (`surroundings_other_id`) REFERENCES `map` (`map_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Data exporting was unselected.

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
