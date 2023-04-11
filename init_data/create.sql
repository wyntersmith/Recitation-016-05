DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE IF NOT EXISTS users (
	user_id SERIAL PRIMARY KEY NOT NULL,
	firstName VARCHAR(100) NULL,
    lastName VARCHAR(100) NULL,
    username VARCHAR(50) NOT NULL,
    password VARCHAR(500) NOT NULL,
    email VARCHAR(100) NULL
);

DROP TABLE IF EXISTS party_info CASCADE;
CREATE TABLE IF NOT EXISTS party_info (
	party_id SERIAL PRIMARY KEY NOT NULL,
    host_user_id BIGINT UNSIGNED NOT NULL,
    location VARCHAR(100) NOT NULL,
    FOREIGN KEY(host_user_id)
		REFERENCES users(user_id)
);

DROP TABLE IF EXISTS user_parties CASCADE;
CREATE TABLE IF NOT EXISTS user_parties (
	user_id SERIAL PRIMARY KEY NOT NULL,
    parties_attended BIGINT UNSIGNED,
    parties_hosted BIGINT UNSIGNED,
    FOREIGN KEY (user_id)
		REFERENCES users(user_id)
);