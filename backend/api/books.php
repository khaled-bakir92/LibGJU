<?php
/**
 * Books API
 * Handles CRUD operations for books
 */

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../../database/database.php';

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
        // Get all books or a single book
        if (isset($_GET['id'])) {
            $id = $_GET['id'];
            $query = "SELECT * FROM books WHERE id = :id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":id", $id);
        } else {
            $query = "SELECT * FROM books ORDER BY created_at DESC";
            $stmt = $db->prepare($query);
        }

        $stmt->execute();
        $books = $stmt->fetchAll(PDO::FETCH_ASSOC);

        http_response_code(200);
        echo json_encode(array(
            "success" => true,
            "data" => $books
        ));
        break;

    case 'POST':
        // Create new book
        $data = json_decode(file_get_contents("php://input"));

        if (!empty($data->title) && !empty($data->author) && !empty($data->isbn)) {
            $query = "INSERT INTO books (title, author, isbn, description, image_url, status)
                      VALUES (:title, :author, :isbn, :description, :image_url, 'available')";

            $stmt = $db->prepare($query);
            $stmt->bindParam(":title", $data->title);
            $stmt->bindParam(":author", $data->author);
            $stmt->bindParam(":isbn", $data->isbn);
            $stmt->bindParam(":description", $data->description);

            // Auto-generate image URL from ISBN if not provided
            $imageUrl = !empty($data->imageUrl) ? $data->imageUrl : "https://covers.openlibrary.org/b/isbn/" . str_replace("-", "", $data->isbn) . "-M.jpg";
            $stmt->bindParam(":image_url", $imageUrl);

            if ($stmt->execute()) {
                $lastId = $db->lastInsertId();

                // Log activity
                $activityText = "New book '" . $data->title . "' added to library";
                logActivity($db, $activityText);

                http_response_code(201);
                echo json_encode(array(
                    "success" => true,
                    "message" => "Book created successfully",
                    "id" => $lastId
                ));
            } else {
                http_response_code(500);
                echo json_encode(array(
                    "success" => false,
                    "message" => "Unable to create book"
                ));
            }
        } else {
            http_response_code(400);
            echo json_encode(array(
                "success" => false,
                "message" => "Title, author, and ISBN are required"
            ));
        }
        break;

    case 'PUT':
        // Update book
        $data = json_decode(file_get_contents("php://input"));

        if (!empty($data->id) && !empty($data->title) && !empty($data->author) && !empty($data->isbn)) {
            $query = "UPDATE books
                      SET title = :title, author = :author, isbn = :isbn, description = :description, image_url = :image_url
                      WHERE id = :id";

            $stmt = $db->prepare($query);
            $stmt->bindParam(":id", $data->id);
            $stmt->bindParam(":title", $data->title);
            $stmt->bindParam(":author", $data->author);
            $stmt->bindParam(":isbn", $data->isbn);
            $stmt->bindParam(":description", $data->description);
            $stmt->bindParam(":image_url", $data->imageUrl);

            if ($stmt->execute()) {
                // Log activity
                $activityText = "Book '" . $data->title . "' updated";
                logActivity($db, $activityText);

                http_response_code(200);
                echo json_encode(array(
                    "success" => true,
                    "message" => "Book updated successfully"
                ));
            } else {
                http_response_code(500);
                echo json_encode(array(
                    "success" => false,
                    "message" => "Unable to update book"
                ));
            }
        } else {
            http_response_code(400);
            echo json_encode(array(
                "success" => false,
                "message" => "ID, title, author, and ISBN are required"
            ));
        }
        break;

    case 'DELETE':
        // Delete book
        $data = json_decode(file_get_contents("php://input"));

        if (!empty($data->id)) {
            // Check if book is currently borrowed
            $checkQuery = "SELECT COUNT(*) as count FROM loans WHERE book_id = :id AND status IN ('active', 'overdue')";
            $checkStmt = $db->prepare($checkQuery);
            $checkStmt->bindParam(":id", $data->id);
            $checkStmt->execute();
            $result = $checkStmt->fetch(PDO::FETCH_ASSOC);

            if ($result['count'] > 0) {
                http_response_code(400);
                echo json_encode(array(
                    "success" => false,
                    "message" => "Cannot delete book. It is currently borrowed."
                ));
            } else {
                $query = "DELETE FROM books WHERE id = :id";
                $stmt = $db->prepare($query);
                $stmt->bindParam(":id", $data->id);

                if ($stmt->execute()) {
                    // Log activity
                    $activityText = "Book deleted from library";
                    logActivity($db, $activityText);

                    http_response_code(200);
                    echo json_encode(array(
                        "success" => true,
                        "message" => "Book deleted successfully"
                    ));
                } else {
                    http_response_code(500);
                    echo json_encode(array(
                        "success" => false,
                        "message" => "Unable to delete book"
                    ));
                }
            }
        } else {
            http_response_code(400);
            echo json_encode(array(
                "success" => false,
                "message" => "Book ID is required"
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
function logActivity($db, $text) {
    $query = "INSERT INTO activity_log (activity_text) VALUES (:text)";
    $stmt = $db->prepare($query);
    $stmt->bindParam(":text", $text);
    $stmt->execute();
}
?>
