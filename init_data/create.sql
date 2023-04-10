CREATE DATABASE party_finder;
USE party_finder;

DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE IF NOT EXISTS users (
	user_id SERIAL PRIMARY KEY NOT NULL,
	firstName VARCHAR(100) NOT NULL,
    lastName VARCHAR(100) NOT NULL,
    username VARCHAR(50) NOT NULL,
    password VARCHAR(500) NOT NULL,
    email VARCHAR(100) NOT NULL
);

DROP TABLE IF EXISTS party_info CASCADE;
CREATE TABLE IF NOT EXISTS party_info (
	party_id SERIAL PRIMARY KEY NOT NULL,
    host_user_id SERIAL NOT NULL,
    location VARCHAR(100) NOT NULL,
    FOREIGN KEY(user_id)
		REFERENCES users(user_id)
);

DROP TABLE IF EXISTS user_parties CASCADE;
CREATE TABLE IF NOT EXISTS user_parties (
	user_id SERIAL PRIMARY KEY NOT NULL,
    parties_attended SERIAL,
    parties_hosted SERIAL,
    FOREIGN KEY (user_id)
		REFERENCES users(user_id)
);