CREATE DATABASE IF NOT EXISTS `Union` DEFAULT CHARACTER SET utf8;
USE Union;


CREATE TABLE IF NOT EXISTS `account_1` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nickname` varchar(16) DEFAULT NULL,
  `email` varchar(26) NOT NULL UNIQUE,
  `password` varchar(18) DEFAULT NULL,
  `sex` boolean  DEFAULT true,
  `haswallet` boolean DEFAULT false,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `wallet_1` (
  `id` int NOT NULL PRIMARY KEY,
  `public_key` varchar(60) NOT NULL UNIQUE,
  `salt` varchar(8) NOT NULL, 
  `credit` float unsigned zerofill DEFAULT 0,
  `balance` float signed zerofill DEFAULT 0,
  `status` tinyint(2) signed zerofill DEFAULT 0,
  `pending` int unsigned zerofill DEFAULT 0,
  FOREIGN KEY (id) REFERENCES Account_1(id)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `transfer_1` (
  `id` int NOT NULL PRIMARY KEY,
  `transe_des` varchar(255),
  FOREIGN KEY (id) REFERENCES Account_1(id)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;


