<?php

require_once "../db.php";


function send_response($status, $message)
{
  echo json_encode(["status" => $status, "message" => $message]);
  exit();
}

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
  send_response("error", "Invalid request method.");
}

//.get form data
$name = isset($_POST['name']) ? trim($_POST['name']) : '';
$rating = isset($_POST['rating']) ? intval($_POST['rating']) : 0;
$comments = isset($_POST['comments']) ? trim($_POST['comments']) : '';
$suggestions = isset($_POST['suggestions']) ? trim($_POST['suggestions']) : null;

// if (empty($name) || empty($rating) || empty($comments)) {
//   send_response("error", "Please fill in all required fields.");
// }

$stmt = $conn->prepare("INSERT INTO feedback (name, rating, comments, suggestions) VALUES (?, ?, ?, ?)");

// str, int, str, str
$stmt->bind_param("siss", $name, $rating, $comments, $suggestions);

// execute statement
if ($stmt->execute()) {
  send_response("success", "Your feedback has been submitted. Thank you!");
} else {
  error_log("Execute failed: " . $stmt->error);
  send_response("error", "Failed to submit feedback. Please try again later.");
}

$stmt->close();
$conn->close();
