 CREATE TABLE `user` (
  `id` int NOT NULL AUTO_INCREMENT,
  username varchar(255) not null default '',
  email varchar(255) not null default '',
  password varchar(255) not null default '',
  loggedin_cnt int not null default 0,
  created_at timestamp,
  updated_at timestamp,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_i;

CREATE TABLE `files` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL DEFAULT '0',
  `url` varchar(255) not null default '',
   `filename` varchar(255) not null default 'f',
  `filetype` varchar(255) NOT NULL DEFAULT 'txt',
  `content` blob,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`)
);

CREATE TABLE `file_meta` (
  `file_id` int NOT NULL,
  `meta` json DEFAULT NULL,
  key(file_id)
)

CREATE TABLE `file_blobs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `file_id` int NOT NULL,
  `blob_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
);
-- drop table if exists blobs;
 CREATE TABLE `blobs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `content` blob,
  PRIMARY KEY (`id`)
);

create table available_usernames (
    username varchar(255) not null unique,
   taken  BOOL not null default false
)

create table adj (
    string varchar(16) not null unique
)

create table noun (
    string varchar(16) not null unique
)
