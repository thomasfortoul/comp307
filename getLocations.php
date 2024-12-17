<?php
// getLocations.php

// Define database connection URI
$uri = "mysql://avnadmin:AVNS_kM0epupekoMax6jKOg9@mysql-31c65a70-thomasfortoul0812-417b.g.aivencloud.com:11797/defaultdb?ssl-mode=REQUIRED";

// Parse the URI to extract connection details
$fields = parse_url($uri);

// Build the DSN string, including SSL settings
$conn = "mysql:";
$conn .= "host=" . $fields["host"];
$conn .= ";port=" . $fields["port"];
$conn .= ";dbname=comp307";
$conn .= ";sslmode=verify-ca;sslrootcert=ca.pem";

// Initialize a response array
$response = ['status' => 'error', 'message' => '', 'data' => null];

try {
    // Create a PDO instance and attempt to connect to the database
    $db = new PDO($conn, $fields["user"], $fields["pass"]);
    
    // Set PDO error mode to exception for better error reporting
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Check if the connection is successful
    $response['status'] = 'success';
    $response['message'] = "Database connection successful!";
} catch (Exception $e) {
    // Catch connection errors and set appropriate response message
    $response['message'] = "Error connecting to the database: " . $e->getMessage();
    echo json_encode($response);  // Return error response and exit
    exit;
}

// Check if the required 'user_id' parameter is present in the POST request
if (!isset($_POST['user_id']) || empty($_POST['user_id'])) {
    $response['message'] = "Error: 'user_id' is missing or invalid.";
    echo json_encode($response);  // Return error response
    exit;
}

$user_id = $_POST['user_id'];

// Prepare the SQL statement to fetch locations for the given user_id
$stmt = $db->prepare("SELECT city, admin, country, date_added FROM comp307.Location WHERE user_id = ?");
$stmt->bindValue(1, $user_id, PDO::PARAM_INT);

try {
    // Execute the query and fetch results
    $stmt->execute();
    $locations = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Check if any locations were found
    if ($locations) {
        $response['status'] = 'success';
        $response['message'] = "Locations retrieved successfully.";
        $response['data'] = $locations;  // Include the retrieved locations
    } else {
        $response['message'] = "No locations found for the specified user.";
    }
} catch (Exception $e) {
    // Handle any SQL execution errors
    $response['message'] = "Error retrieving locations: " . $e->getMessage();
}

// Return the response as JSON
echo json_encode($response);

// Close the database connection
$db = null;
?>
