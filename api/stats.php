<?php
/**
 * Statistics API
 * Returns dashboard statistics
 */

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Get total books
    $totalBooksQuery = "SELECT COUNT(*) as total FROM books";
    $totalBooksStmt = $db->prepare($totalBooksQuery);
    $totalBooksStmt->execute();
    $totalBooks = $totalBooksStmt->fetch(PDO::FETCH_ASSOC)['total'];

    // Get available books
    $availableBooksQuery = "SELECT COUNT(*) as total FROM books WHERE status = 'available'";
    $availableBooksStmt = $db->prepare($availableBooksQuery);
    $availableBooksStmt->execute();
    $availableBooks = $availableBooksStmt->fetch(PDO::FETCH_ASSOC)['total'];

    // Get total students
    $totalStudentsQuery = "SELECT COUNT(*) as total FROM users WHERE role = 'student'";
    $totalStudentsStmt = $db->prepare($totalStudentsQuery);
    $totalStudentsStmt->execute();
    $totalStudents = $totalStudentsStmt->fetch(PDO::FETCH_ASSOC)['total'];

    // Get active loans
    $activeLoansQuery = "SELECT COUNT(*) as total FROM loans WHERE status IN ('active', 'overdue')";
    $activeLoansStmt = $db->prepare($activeLoansQuery);
    $activeLoansStmt->execute();
    $activeLoans = $activeLoansStmt->fetch(PDO::FETCH_ASSOC)['total'];

    http_response_code(200);
    echo json_encode(array(
        "success" => true,
        "data" => array(
            "totalBooks" => $totalBooks,
            "availableBooks" => $availableBooks,
            "totalStudents" => $totalStudents,
            "activeLoans" => $activeLoans
        )
    ));
} else {
    http_response_code(405);
    echo json_encode(array(
        "success" => false,
        "message" => "Method not allowed"
    ));
}
?>
