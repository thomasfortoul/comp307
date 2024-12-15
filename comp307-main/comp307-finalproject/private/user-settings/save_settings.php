<?php
session_start();

if (!isset($_SESSION['user_id'])) {
  http_response_code(401);
  echo json_encode(['error' => 'Unauthorized']);
  exit();
}

$user_id = $_SESSION['user_id'];

//Get POST data
$data = json_decode(file_get_contents("php://input"), true);

$allowed_settings = ['temperature', 'windSpeed', 'timePreference', 'distance', 'colorTheme'];
$settings = [];

foreach ($allowed_settings as $setting) {
  if (isset($data[$setting])) {
    $settings[$setting] = $data[$setting];
  } else {
    switch ($setting) {
      case 'temperature':
        $settings[$setting] = 'Celsius';
        break;
      case 'windSpeed':
        $settings[$setting] = 'km/h';
        break;
      case 'timePreference':
        $settings[$setting] = '24-hour';
        break;
      case 'distance':
        $settings[$setting] = 'km';
        break;
      case 'colorTheme':
        $settings[$setting] = 'Light';
        break;
    }
  }
}

require '../db.php';

// prepare and execute statemnt
$stmt = $conn->prepare("UPDATE users SET temperature = ?, windSpeed = ?, timePreference = ?, distance = ?, colorTheme = ? WHERE id = ?");

$stmt->bind_param(
  "sssssi",
  $settings['temperature'],
  $settings['windSpeed'],
  $settings['timePreference'],
  $settings['distance'],
  $settings['colorTheme'],
  $user_id
);

if ($stmt->execute()) {
  echo json_encode(['message' => 'Settings updated successfully.']);
} else {
  http_response_code(500);
  echo json_encode(['error' => 'Failed to update settings.']);
}

$stmt->close();
$conn->close();
