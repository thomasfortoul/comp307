<?php
// addLocation.php
$uri = "mysql://avnadmin:AVNS_kM0epupekoMax6jKOg9@mysql-31c65a70-thomasfortoul0812-417b.g.aivencloud.com:11797/defaultdb?ssl-mode=REQUIRED";

$fields = parse_url($uri);

// build the DSN including SSL settings
$conn = "mysql:";
$conn .= "host=" . $fields["host"];
$conn .= ";port=" . $fields["port"];
$conn .= ";dbname=comp307";
$conn .= ";sslmode=verify-ca;sslrootcert=ca.pem";

try {
  // Create a PDO instance and connect to the database
  $db = new PDO($conn, $fields["user"], $fields["pass"]);
  
  // Debugging: Check the connection
  // echo "Database connection successful!<br>";

  // Check if the connection is working by executing a simple query (e.g., getting the version)
  $stmt = $db->query("SELECT VERSION()");
  $version = $stmt->fetch()[0];
} catch (Exception $e) {
  echo "Error: " . $e->getMessage();
}

// Get the data from the request
$user_id = $_POST['user_id']; // assuming user_id is passed in the request
$city = $_POST['city'];
$admin = isset($_POST['admin']) ? $_POST['admin'] : NULL; // can be NULL if not provided
$country = $_POST['country'];

// Check if the city already exists for this user
$checkStmt = $db->prepare("SELECT COUNT(*) FROM comp307.Location WHERE user_id = ? AND city = ?");
$checkStmt->bindValue(1, $user_id, PDO::PARAM_INT);
$checkStmt->bindValue(2, $city, PDO::PARAM_STR);
$checkStmt->execute();
$cityExists = $checkStmt->fetchColumn();

if ($cityExists > 0) {
    echo "Error: The city already exists for this user.";
} else {
    // Prepare the SQL query using named placeholders or question marks
    $stmt = $db->prepare("INSERT INTO comp307.Location (user_id, city, admin, country) VALUES (?, ?, ?, ?)");

    // Bind the parameters using bindValue
    $stmt->bindValue(1, $user_id, PDO::PARAM_INT);
    $stmt->bindValue(2, $city, PDO::PARAM_STR);
    $stmt->bindValue(3, $admin, PDO::PARAM_STR);
    $stmt->bindValue(4, $country, PDO::PARAM_STR);

    // Execute the query and check if it was successful
    if ($stmt->execute()) {
        echo "Location added successfully!";
    } else {
        echo "Error: Unable to add location.";
    }
}

// Close the connection
$db = null;
?>
