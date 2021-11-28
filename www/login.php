<head>
    <meta charset="UTF-8">

    <head>

        <?php
        if (
            isset($_POST["login"]) &&
            isset($_POST["password"])
        ) {
            include './assets/config.php';

            if (!$conn) {
                die("Connection failed: " . mysqli_connect_error());
                session_write_close();
                header("Location: index.php");
            }

            $haslo = $_POST["password"];
            $haslo = hash('sha256', $haslo);
            $login = $_POST["login"];
            $logindb = mysqli_real_escape_string($conn, $login);
            $sql = "SELECT * FROM users WHERE nickname='$logindb';";
            $result = mysqli_query($conn, $sql);
            $result = mysqli_fetch_assoc($result);
            $hash = $result['password'];

            if ($haslo == $hash) {

                $_SESSION['user_id'] = $result['id'];
                if ($result["first_login"] = 1) {
                    $_SESSION['fl'] = 1;
                }
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
        ?>