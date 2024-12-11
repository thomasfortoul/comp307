<?php
session_start();
include 'db.php'; // Include your database connection file
var_dump($_POST);
// Get form data
$email = $_POST['email'];
$password = $_POST['password'];
var_dump($email);  // Debugging output
var_dump($password);  // Debugging output

// Validate credentials
$stmt = $pdo->prepare("SELECT * FROM Users WHERE Email = ?");
$stmt->execute([$email]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);
// Print the query result to verify it's fetching the correct user
var_dump($user); // Debugging output

// Check if the password hash in the database matches the password entered
if ($user && password_verify($password, $user['PasswordHash'])) {
    // Login successful
    $_SESSION['user_id'] = $user['UserID'];
    $_SESSION['user_name'] = $user['Name'];
    header("Location: dashboard.php");
    exit();
} else {
    // Invalid credentials
    echo "Invalid email or password.";
}

if ($user && password_verify($password, $user['PasswordHash'])) {
    // Login successful
    $_SESSION['user_id'] = $user['UserID'];
    $_SESSION['user_name'] = $user['Name'];
    header("Location: dashboard.php");
    exit();
} else {
    // Invalid credentials
    echo "Invalid email or password.";
}
?>

