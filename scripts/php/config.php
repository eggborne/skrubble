<?php
  header('Access-Control-Allow-Origin: *');
  header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
  header("Access-Control-Allow-Headers: Content-Type, Authorization");
  $host = getenv('DB_HOST');
  $un = getenv('DB_USER');
  $pw = getenv('DB_PASS');
  $db_name = getenv('DB_NAME');
  $link = mysqli_connect($host, $un, $pw, $db_name);
  $OPEN_API_KEY = getenv('OPEN_API_KEY');
?>