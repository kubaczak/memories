<head>
    <meta charset="UTF-8">
</head>

<?php
if (isset($_POST['password']) && isset($_POST['rpassword'])) {
    include './assets/config.php';
    if (!$conn) {
        die("Connection failed: " . mysqli_connect_error());
        session_write_close();
        header("Location: index.php");
    }
    $haslo = $_POST["password"];
    $haslo = hash('sha256', $haslo);
    $rhaslo = $_POST["rpassword"];
    $rhaslo = hash('sha256', $rhaslo);
    if ($haslo == $rhaslo) {
        $id = $_SESSION['user_id'];
        $sql = "UPDATE users SET password='$haslo', first_login=0 WHERE id=$id;";
        mysqli_query($conn, $sql);
        unset($_SESSION['fl']);
        session_write_close();
        header("Location: index.php");
    } else {
        session_write_close();
        header("Location: index.php");
    }
} else {
    session_write_close();
    header("Location: index.php");
}
