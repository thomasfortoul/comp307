<?php
// auth.php
session_start();

if (!isset($_SESSION['UserID'])) {
    // Redirect to login if not logged in
    header("Location: login.php");
    exit();
}
?>