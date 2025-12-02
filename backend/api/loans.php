<?php
/**
 * Loans API
 * Handles CRUD operations for book loans
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
        // Get all loans with book and student details
        if (isset($_GET['student_id'])) {
            // Get loans for a specific student
            $studentId = $_GET['student_id'];
            $query = "SELECT l.*, b.title as book_title, b.image_url, u.name as student_name
                      FROM loans l
                      JOIN books b ON l.book_id = b.id
                      JOIN users u ON l.student_id = u.student_id
                      WHERE l.student_id = :student_id AND l.status IN ('active', 'overdue')
                      ORDER BY l.created_at DESC";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":student_id", $studentId);
        } elseif (isset($_GET['status'])) {
            // Filter by status
            $status = $_GET['status'];
            $query = "SELECT l.*, b.title as book_title, b.image_url, u.name as student_name
                      FROM loans l
                      JOIN books b ON l.book_id = b.id
                      JOIN users u ON l.student_id = u.student_id
                      WHERE l.status = :status
                      ORDER BY l.created_at DESC";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":status", $status);
        } else {
            // Get all loans
            $query = "SELECT l.*, b.title as book_title, b.image_url, u.name as student_name
                      FROM loans l
                      JOIN books b ON l.book_id = b.id
                      JOIN users u ON l.student_id = u.student_id
                      ORDER BY l.created_at DESC";
            $stmt = $db->prepare($query);
        }

        $stmt->execute();
        $loans = $stmt->fetchAll(PDO::FETCH_ASSOC);

        http_response_code(200);
        echo json_encode(array(
            "success" => true,
            "data" => $loans
        ));
        break;

    case 'POST':
        // Create new loan (borrow book)
        $input = file_get_contents("php://input");
        error_log("POST /loans.php - Raw input: " . $input);

        $data = json_decode($input);
        error_log("POST /loans.php - Decoded data: " . print_r($data, true));

        if (!empty($data->bookId) && !empty($data->studentId)) {
            error_log("POST /loans.php - bookId: " . $data->bookId . ", studentId: " . $data->studentId);
            // Check if book is available
            $checkQuery = "SELECT status, title FROM books WHERE id = :book_id";
            $checkStmt = $db->prepare($checkQuery);
            $checkStmt->bindParam(":book_id", $data->bookId);
            $checkStmt->execute();
            $book = $checkStmt->fetch(PDO::FETCH_ASSOC);

            if (!$book) {
                http_response_code(404);
                echo json_encode(array(
                    "success" => false,
                    "message" => "Book not found"
                ));
                exit;
            }

            if ($book['status'] !== 'available') {
                http_response_code(400);
                echo json_encode(array(
                    "success" => false,
                    "message" => "Book is not available for borrowing"
                ));
                exit;
            }

            // Calculate due date (14 days from now)
            $borrowDate = date('Y-m-d');
            $dueDate = date('Y-m-d', strtotime('+14 days'));

            // Insert loan
            $query = "INSERT INTO loans (book_id, student_id, borrow_date, due_date, status)
                      VALUES (:book_id, :student_id, :borrow_date, :due_date, 'active')";

            $stmt = $db->prepare($query);
            $stmt->bindParam(":book_id", $data->bookId);
            $stmt->bindParam(":student_id", $data->studentId);
            $stmt->bindParam(":borrow_date", $borrowDate);
            $stmt->bindParam(":due_date", $dueDate);

            if ($stmt->execute()) {
                $loanId = $db->lastInsertId();

                // Update book status to unavailable
                $updateBookQuery = "UPDATE books SET status = 'unavailable' WHERE id = :book_id";
                $updateBookStmt = $db->prepare($updateBookQuery);
                $updateBookStmt->bindParam(":book_id", $data->bookId);
                $updateBookStmt->execute();

                // Update student's active loans count
                $updateUserQuery = "UPDATE users SET active_loans = active_loans + 1 WHERE student_id = :student_id";
                $updateUserStmt = $db->prepare($updateUserQuery);
                $updateUserStmt->bindParam(":student_id", $data->studentId);
                $updateUserStmt->execute();

                // Get student name for activity log
                $getUserQuery = "SELECT name FROM users WHERE student_id = :student_id";
                $getUserStmt = $db->prepare($getUserQuery);
                $getUserStmt->bindParam(":student_id", $data->studentId);
                $getUserStmt->execute();
                $user = $getUserStmt->fetch(PDO::FETCH_ASSOC);

                // Log activity
                $activityText = $user['name'] . " borrowed '" . $book['title'] . "'";
                logActivity($db, $activityText);

                http_response_code(201);
                echo json_encode(array(
                    "success" => true,
                    "message" => "Book borrowed successfully",
                    "loan_id" => $loanId,
                    "due_date" => $dueDate
                ));
            } else {
                http_response_code(500);
                echo json_encode(array(
                    "success" => false,
                    "message" => "Unable to create loan"
                ));
            }
        } else {
            http_response_code(400);
            echo json_encode(array(
                "success" => false,
                "message" => "Book ID and Student ID are required"
            ));
        }
        break;

    case 'PUT':
        // Return book
        $data = json_decode(file_get_contents("php://input"));

        if (!empty($data->loanId)) {
            // Get loan details
            $getLoanQuery = "SELECT l.*, b.title as book_title, u.name as student_name
                             FROM loans l
                             JOIN books b ON l.book_id = b.id
                             JOIN users u ON l.student_id = u.student_id
                             WHERE l.id = :loan_id";
            $getLoanStmt = $db->prepare($getLoanQuery);
            $getLoanStmt->bindParam(":loan_id", $data->loanId);
            $getLoanStmt->execute();
            $loan = $getLoanStmt->fetch(PDO::FETCH_ASSOC);

            if (!$loan) {
                http_response_code(404);
                echo json_encode(array(
                    "success" => false,
                    "message" => "Loan not found"
                ));
                exit;
            }

            // Update loan status to returned
            $returnDate = date('Y-m-d');
            $query = "UPDATE loans SET status = 'returned', return_date = :return_date WHERE id = :loan_id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":loan_id", $data->loanId);
            $stmt->bindParam(":return_date", $returnDate);

            if ($stmt->execute()) {
                // Update book status to available
                $updateBookQuery = "UPDATE books SET status = 'available' WHERE id = :book_id";
                $updateBookStmt = $db->prepare($updateBookQuery);
                $updateBookStmt->bindParam(":book_id", $loan['book_id']);
                $updateBookStmt->execute();

                // Update student's active loans count
                $updateUserQuery = "UPDATE users SET active_loans = active_loans - 1 WHERE student_id = :student_id";
                $updateUserStmt = $db->prepare($updateUserQuery);
                $updateUserStmt->bindParam(":student_id", $loan['student_id']);
                $updateUserStmt->execute();

                // Log activity
                $activityText = $loan['student_name'] . " returned '" . $loan['book_title'] . "'";
                logActivity($db, $activityText);

                http_response_code(200);
                echo json_encode(array(
                    "success" => true,
                    "message" => "Book returned successfully"
                ));
            } else {
                http_response_code(500);
                echo json_encode(array(
                    "success" => false,
                    "message" => "Unable to return book"
                ));
            }
        } else {
            http_response_code(400);
            echo json_encode(array(
                "success" => false,
                "message" => "Loan ID is required"
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
