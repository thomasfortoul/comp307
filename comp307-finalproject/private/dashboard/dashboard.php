<?php
// login.php

$uri = "mysql://avnadmin:AVNS_kM0epupekoMax6jKOg9@mysql-31c65a70-thomasfortoul0812-417b.g.aivencloud.com:11797/defaultdb?ssl-mode=REQUIRED";

$fields = parse_url($uri);

// Build the DSN including SSL settings
$conn = "mysql:";
$conn .= "host=" . $fields["host"];
$conn .= ";port=" . $fields["port"];
$conn .= ";dbname=comp307";
$conn .= ";sslmode=verify-ca;sslrootcert=ca.pem";

try {
    // Create a PDO instance and connect to the database
    $db = new PDO($conn, $fields["user"], $fields["pass"]);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    #####echo "Database connection successful!<br>"; // Debugging
} catch (Exception $e) {
    error_log("Database connection error: " . $e->getMessage());
    die("Database connection failed: " . $e->getMessage()); // Show error for debugging
}
session_start();

$email = filter_input(INPUT_POST, 'email', FILTER_SANITIZE_EMAIL);
echo $_SERVER;

echo $email;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get and sanitize user input
    $email = filter_input(INPUT_POST, 'email', FILTER_SANITIZE_EMAIL);
    $password = filter_input(INPUT_POST, 'password', FILTER_SANITIZE_STRING);

    // Print inputs for debugging
    #####echo "Received email: $email<br>";
    #####echo "Received password: [Hidden for security]<br>";

    if ($email && $password) {
        try {
            // Query to fetch user by email
            ####echo "Preparing to query database for user.<br>";
            $stmt = $db->prepare("SELECT * FROM comp307.Users WHERE Email = ?");
            $stmt->execute([$email]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            // Debugging: Check if user exists
            if ($user) {
                ####echo "User found in database: " . print_r($user, true) . "<br>";
            } else {
                ####echo "No user found with email: $email<br>";
            }

            // Check credentials
            if ($user && password_verify($password, $user['PasswordHash'])) {
                ####echo "Password verification successful.<br>";

                // Update `LoggedIn` status
                $updateStmt = $db->prepare("UPDATE comp307.Users SET IsLoggedIn = 1 WHERE UserID = ?");
                $updateStmt->execute([$user['UserID']]);
                ####echo "User's LoggedIn status updated successfully.<br>";

                // Set session variables and redirect
                $_SESSION['user_id'] = $user['UserID'];
                $_SESSION['user_email'] = $user['Email'];
                echo $_SESSION['user_email'];
                echo $_SESSION['user_id'];

                ####echo "Redirecting to ~../../private/dashboard/dashboard.php<br>, user id is";
                ####echo $user['UserID'];
                header("Location: ../../private/dashboard/dashboard.php"); #/landing/login.php../../private/dashboard/dashboard.php");
                #####echo "STILL IN LOGIN.PHP";
                exit();
            } else {
                #####echo "Invalid email or password.<br>";
            }
        } catch (Exception $e) {
            #####echo "Error during login process: " . $e->getMessage() . "<br>";
        }
    } else {
        #####echo "Please enter both email and password.<br>";
    }
}
else{
    #####echo "FAILFAILLFAIOL";
}
?>


<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Climate Compass</title>
    <link
      href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css"
      rel="stylesheet"
    />
  </head>
  <body>
    <div class="container">
      <h1>Welcome to your Dashboard!</h1>
      <p>Your user ID is: <?php echo $user_id; ?></p>
      <!-- You can also fetch other user details from the session if needed -->
      <p>Your name is: <?php echo $_SESSION['user_name']; ?></p>
      <!-- Dashboard content here -->
    </div>
  </body>
</html>
