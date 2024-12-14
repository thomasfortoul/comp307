<?php
session_start();

if (!isset($_SESSION['user_id'])) {
  http_response_code(401);
  echo json_encode(['error' => 'Unauthorized']);
  exit();
}

$user_id = $_SESSION['user_id'];

require '../db.php';

//prepare and execute statement
$stmt = $conn->prepare("SELECT temperature, windSpeed, timePreference, distance, colorTheme FROM users WHERE id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
  $settings = $result->fetch_assoc();
  echo json_encode($settings);
} else {
  // user not found -> default settings
  echo json_encode([
    'temperature' => 'Celsius',
    'windSpeed' => 'km/h',
    'timePreference' => '24-hour',
    'distance' => 'km',
    'colorTheme' => 'Light'
  ]);
}

$stmt->close();
$conn->close();
