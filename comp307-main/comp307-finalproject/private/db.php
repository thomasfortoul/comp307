<?php
$host = '127.0.0.1'; // or 'localhost'
$db = 'comp307database'; // Your database name
$user = 'comp307'; // Username
$pass = 'mcgill'; // No password, leave this empty

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    echo "Database connection successful!";
} catch (PDOException $e) {
    die("Database connection failed: " . $e->getMessage());
}
?>
