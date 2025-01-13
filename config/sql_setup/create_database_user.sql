-- create app user in database
CREATE USER 'snake_user'@'localhost' IDENTIFIED BY 'yourpassword';
GRANT ALL PRIVILEGES ON snake_game.* TO 'snake_user'@'localhost';
FLUSH PRIVILEGES;
