<?php
/**
 * Users API
 * Handles CRUD operations for students and users
 */

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

// Handle OPTIONS request for CORS preflight
if ($method === 'OPTIONS') {
    http_response_code(200);
    exit();
}

switch ($method) {
    case 'GET':
        // Get all users or a single user
        if (isset($_GET['id'])) {
            $id = $_GET['id'];
            $query = "SELECT id, student_id, name, email, password, role, active_loans, created_at FROM users WHERE id = :id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":id", $id);
        } elseif (isset($_GET['student_id'])) {
            $studentId = $_GET['student_id'];
            $query = "SELECT id, student_id, name, email, password, role, active_loans, created_at FROM users WHERE student_id = :student_id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":student_id", $studentId);
        } else {
            // Get all students (exclude admin/employee)
            $query = "SELECT id, student_id, name, email, password, role, active_loans, created_at FROM users WHERE role = 'student' ORDER BY created_at DESC";
            $stmt = $db->prepare($query);
        }

        $stmt->execute();
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

        http_response_code(200);
        echo json_encode(array(
            "success" => true,
            "data" => $users
        ));
        break;

    case 'POST':
        // Create new student
        $data = json_decode(file_get_contents("php://input"));

        if (!empty($data->studentId) && !empty($data->name) && !empty($data->email) && !empty($data->password)) {
            // Check if student ID already exists
            $checkQuery = "SELECT COUNT(*) as count FROM users WHERE student_id = :student_id";
            $checkStmt = $db->prepare($checkQuery);
            $checkStmt->bindParam(":student_id", $data->studentId);
            $checkStmt->execute();
            $result = $checkStmt->fetch(PDO::FETCH_ASSOC);

            if ($result['count'] > 0) {
                http_response_code(400);
                echo json_encode(array(
                    "success" => false,
                    "message" => "Student ID already exists"
                ));
            } else {
                $query = "INSERT INTO users (student_id, name, email, password, role, active_loans)
                          VALUES (:student_id, :name, :email, :password, 'student', 0)";

                $stmt = $db->prepare($query);
                $stmt->bindParam(":student_id", $data->studentId);
                $stmt->bindParam(":name", $data->name);
                $stmt->bindParam(":email", $data->email);
                $stmt->bindParam(":password", $data->password); // Note: In production, use password_hash()

                if ($stmt->execute()) {
                    $lastId = $db->lastInsertId();

                    // Log activity
                    $activityText = "New student '" . $data->name . "' registered";
                    logActivity($db, $activityText);

                    http_response_code(201);
                    echo json_encode(array(
                        "success" => true,
                        "message" => "Student created successfully",
                        "id" => $lastId
                    ));
                } else {
                    http_response_code(500);
                    echo json_encode(array(
                        "success" => false,
                        "message" => "Unable to create student"
                    ));
                }
            }
        } else {
            http_response_code(400);
            echo json_encode(array(
                "success" => false,
                "message" => "Student ID, name, email, and password are required"
            ));
        }
        break;

    case 'PUT':
        // Update student
        $data = json_decode(file_get_contents("php://input"));

        if (!empty($data->id) && !empty($data->name) && !empty($data->email)) {
            // Check if student_id is being updated and if it already exists
            if (!empty($data->studentId)) {
                $checkQuery = "SELECT COUNT(*) as count FROM users WHERE student_id = :student_id AND id != :id";
                $checkStmt = $db->prepare($checkQuery);
                $checkStmt->bindParam(":student_id", $data->studentId);
                $checkStmt->bindParam(":id", $data->id);
                $checkStmt->execute();
                $result = $checkStmt->fetch(PDO::FETCH_ASSOC);

                if ($result['count'] > 0) {
                    http_response_code(400);
                    echo json_encode(array(
                        "success" => false,
                        "message" => "Student ID already exists"
                    ));
                    break;
                }

                $query = "UPDATE users
                          SET student_id = :student_id, name = :name, email = :email, password = :password
                          WHERE id = :id";

                $stmt = $db->prepare($query);
                $stmt->bindParam(":id", $data->id);
                $stmt->bindParam(":student_id", $data->studentId);
                $stmt->bindParam(":name", $data->name);
                $stmt->bindParam(":email", $data->email);
                $stmt->bindParam(":password", $data->password);
            } else {
                $query = "UPDATE users
                          SET name = :name, email = :email, password = :password
                          WHERE id = :id";

                $stmt = $db->prepare($query);
                $stmt->bindParam(":id", $data->id);
                $stmt->bindParam(":name", $data->name);
                $stmt->bindParam(":email", $data->email);
                $stmt->bindParam(":password", $data->password);
            }

            if ($stmt->execute()) {
                // Log activity
                $activityText = "Student '" . $data->name . "' updated";
                logActivity($db, $activityText);

                http_response_code(200);
                echo json_encode(array(
                    "success" => true,
                    "message" => "Student updated successfully"
                ));
            } else {
                http_response_code(500);
                echo json_encode(array(
                    "success" => false,
                    "message" => "Unable to update student"
                ));
            }
        } else {
            http_response_code(400);
            echo json_encode(array(
                "success" => false,
                "message" => "ID, name, and email are required"
            ));
        }
        break;

    case 'DELETE':
        // Delete student
        $data = json_decode(file_get_contents("php://input"));

        if (!empty($data->id)) {
            // Get student details first
            $getQuery = "SELECT student_id, name, active_loans FROM users WHERE id = :id";
            $getStmt = $db->prepare($getQuery);
            $getStmt->bindParam(":id", $data->id);
            $getStmt->execute();
            $student = $getStmt->fetch(PDO::FETCH_ASSOC);

            if (!$student) {
                http_response_code(404);
                echo json_encode(array(
                    "success" => false,
                    "message" => "Student not found"
                ));
            } elseif ($student['active_loans'] > 0) {
                http_response_code(400);
                echo json_encode(array(
                    "success" => false,
                    "message" => "Cannot delete student. They have active loans."
                ));
            } else {
                $query = "DELETE FROM users WHERE id = :id";
                $stmt = $db->prepare($query);
                $stmt->bindParam(":id", $data->id);

                if ($stmt->execute()) {
                    // Log activity
                    $activityText = "Student '" . $student['name'] . "' deleted";
                    logActivity($db, $activityText);

                    http_response_code(200);
                    echo json_encode(array(
                        "success" => true,
                        "message" => "Student deleted successfully"
                    ));
                } else {
                    http_response_code(500);
                    echo json_encode(array(
                        "success" => false,
                        "message" => "Unable to delete student"
                    ));
                }
            }
        } else {
            http_response_code(400);
            echo json_encode(array(
                "success" => false,
                "message" => "Student ID is required"
            ));
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(array(
            "success" => false,
            "message" => "Method not allowed"
        ));
        break;
}

// Helper function to log activity
function logActivity($db, $text)
{
    $query = "INSERT INTO activity_log (activity_text) VALUES (:text)";
    $stmt = $db->prepare($query);
    $stmt->bindParam(":text", $text);
    $stmt->execute();
}
?>