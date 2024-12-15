<?php
// register.php

// Database connection
$host = '127.0.0.1'; // Database host
$db = 'comp307database'; // Database name
$user = 'comp307'; // Database username
$pass = 'mcgill'; // Password (if you don't use one)
$dsn = "mysql:host=$host;dbname=$db;charset=utf8mb4";

try {
  $pdo = new PDO($dsn, $user, $pass);
  $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
  die("Database connection failed: " . $e->getMessage());
}

// Check if the form is submitted
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  // Get the submitted email and password
  $email = $_POST['email'];
  $password = $_POST['password'];

  // Validate email
  if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    die('Invalid email format');
  }

  // Check if passwords match
  if ($_POST['password'] !== $_POST['confirm-password']) {
    die('Passwords do not match.');
  }


  // Hash the password
  $passwordHash = password_hash($password, PASSWORD_DEFAULT);

  // Prepare the SQL statement
  $sql = "INSERT INTO Users (Email, PasswordHash) VALUES (:email, :passwordHash)";

  try {
    // Prepare and execute the insert query
    $stmt = $pdo->prepare($sql);
    $stmt->bindParam(':email', $email);
    $stmt->bindParam(':passwordHash', $passwordHash);
    $stmt->execute();

    echo "User registered successfully!";
  } catch (PDOException $e) {
    // Handle error if user already exists or any other error
    if ($e->getCode() == 23000) {
      echo "Email already exists. Please use a different email.";
    } else {
      echo "Error: " . $e->getMessage();
    }
  }
}
