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
  host_user_id BIGINT NOT NULL,
  party_name VARCHAR(50),
  latitude DECIMAL(9,6) NOT NULL,
  longitude DECIMAL(9,6) NOT NULL,
  party_address1 TEXT,
  party_address2 TEXT.
  city VARCHAR(255),
  party_state VARCHAR(255),
  zipcode BIGINT,
  party_date DATE NOT NULL,
  start_time TIME(4),
  party_description VARCHAR(144),
  party_image TEXT,
  FOREIGN KEY(host_user_id)
	REFERENCES users(user_id)
);

DROP TABLE IF EXISTS user_parties CASCADE;
CREATE TABLE IF NOT EXISTS user_parties (
	user_id SERIAL PRIMARY KEY NOT NULL,
  parties_attended BIGINT,
  parties_hosted BIGINT,
  FOREIGN KEY (user_id)
  	REFERENCES users(user_id)
);