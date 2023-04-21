INSERT INTO users (user_id, firstName, lastName, username, password, email)
VALUES (12389, 'John', 'Doe', 'john_doe', 'supersecretpassword', 'john.doe@example.com');

INSERT INTO party_info (host_user_id, party_name, latitude, longitude, party_date, start_time, party_description)
VALUES (12389, 'Hill House Party', 40.007473, -105.276146, '2023-05-01', '20:00:00', 'Join us for a great night of music and fun on The Hill!'),
       (12389, 'CU Boulder Campus Bash', 40.007796, -105.262592, '2023-05-07', '18:00:00', 'A massive party at CU Boulder Campus. Bring your friends and make some new ones!'),
       (12389, 'Rooftop Fiesta', 40.004378, -105.269778, '2023-05-14', '19:30:00', 'Enjoy the sunset and party on a rooftop near The Hill. Drinks and snacks provided!'),
       (12389, 'Open Mic Night', 40.009714, -105.276353, '2023-05-21', '19:00:00', 'A chill open mic night at a local venue. Share your talents or just come and enjoy the show.');

