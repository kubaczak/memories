<!DOCTYPE html>
<html lang="pl">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Twoje Wspomnienia</title>
    <script type="text/javascript" src="./assets/datepicker.js"></script>
    <script type="text/javascript" src="./assets/script.js"></script>
    <link rel="stylesheet" href="./assets/datepicker.material.css">
    <link rel="stylesheet" href="./assets/style.css">
</head>

<body>
    <div class="gradient">
        <div class="photo"></div>
        <div id="particles-js"></div>
        <?php if (!isset($_SESSION['user_id'])) { ?>
            <div class="main" id="main">
                <h1>Twoje wspomnienia</h1>
                <div class="button" onclick="changeVisibility('login')"><span>Zaloguj się</span></div>
                <div class="button" onclick="changeVisibility('more')">Więcej informacji</div>
            </div>
            <div class="more invisible" id="more">
                <div class="scroll">
                    <h1>Jak to działa?</h1>
                    <p>Bot w aplikacji Telegram zbiera wspomnienia od użytkownika. Aby rozpocząć, należy napisać wiadomość do bota @MyMemoriesCards_bot i postępować zgodnie z instrukcją. Bot następnie każdego dnia o 21:00 będzie wysyłał wiadomość z przypomnieniem o wysłaniu wspomnienia z danego dnia (o ile wspomnienie nie zostało jeszcze wysłane)
                    </p>
                    <h1>Kiedy wspomnienia będą dla mnie dostępne?</h1>
                    <p>Wspomnienia są przechowywane i ukrywane przed użytkownikiem do końca roku. Dokładnie z nowym rokiem wspomnienia z minionego roku będą dostępne na tej stronie po zalogowaniu.</p>
                    <h1>Jak zresetować hasło?</h1>
                    <p>Aby zresetować hasło należy napisać do bota "/resetujhaslo", bot wygeneruje nowe hasło i będzie można zalogować się od nowa. Po zalogowaniu będzie trzeba ustawić nowe hasło.</p>
                    <h1>Jak wypisać się z programu?</h1>
                    <p>Jeśli chcesz się wyrejestrować i bezpowrotnie usunąć swoje wspomnienia należy napisać do bota "/wypisz". Pamiętaj, że po usunięciu swoich wspomnień nie będzie można ich odzyskać!</p>
                    <h1>Jak uzupełnić wspomnienie z poprzedniego dnia?</h1>
                    <p>Niestety nie jest to możliwe. Wspomnienie można wysłać tylko z aktualnego dnia.</p>
                    <h1>Wciąż szukasz pomocy?</h1>
                    <p>Skontaktuj się ze mną przed e-mail: kontakt@kubaczak.com</p>
                </div>
                <div class="button" onclick="changeVisibility('main')">Powrót</div>
            </div>
            <form action="login.php" method="POST" class="login invisible" id="login">
                <h1>Logowanie</h1>
                <input name="login" type="text" class="input" placeholder="Login">
                <input name="password" type="password" class="input" placeholder="Hasło">
                <button type="submit" class="button">Zaloguj się</button>
                <div onclick="changeVisibility('main')" class="button">Powrót</div>
            </form>
        <?php } elseif (isset($_SESSION['fl'])) {
        ?>
            <form action="changePassword.php" method="POST" class="login">
                <h1>Zmiana hasla</h1>
                <input name="password" type="password" class="input" placeholder="Hasło">
                <input name="rpassword" type="password" class="input" placeholder="Powtórz hasło">
                <button type="submit" class="button">Zmień</button>
            </form>
        <?php
        } else {
            if (isset($_GET['dateRange'])) {
                $dateRange = $_GET['dateRange'];
            }
            if (isset($_GET['size'])) {
                $size = $_GET['size'];
            }
            if (isset($_GET['page'])) {
                $page = $_GET['page'];
            }
            if (isset($_GET['randomized'])) {
                $randomized = $_GET['randomized'];
            }
            $id = $_SESSION['user_id']
        ?>
            <div class="container">
                <form action="index.php" id="settings" method="GET" class="settings">
                    <div class="settingsInputs">
                        <label for="datePicker">Wybierz zakres czasu</label>
                        <input type="text" name="dateRange" class="inputBox" id="datePicker" <?php if (isset($dateRange)) {
                                                                                                    echo "value='$dateRange'";
                                                                                                } else {
                                                                                                    $dateRange = "1.1.2021 - 31.12.2021";
                                                                                                    echo "value='$dateRange'";
                                                                                                } ?> placeholder="Wybierz zakres czasu">
                        <label for="inputSize">Ilość na stronie</label>
                        <input type="number" name="size" class="inputBox" step="10" id="inputSize" <?php if (isset($size)) {
                                                                                                        echo "value='$size'";
                                                                                                    } else {
                                                                                                        $size = 20;
                                                                                                        echo "value='$size'";
                                                                                                    } ?> placeholder="Ilość na stronie">
                        <label for="inputPage">Strona</label>
                        <input type="number" name="page" class="inputBox" onchange="submitForm()" id="inputPage" <?php if (isset($page)) {
                                                                                                                        echo "value='$page'";
                                                                                                                    } else {
                                                                                                                        $page = 1;
                                                                                                                        echo "value='$page'";
                                                                                                                    } ?> placeholder="Strona">
                        <label for="randomized">Losowo</label>
                        <input type="checkbox" name="randomized" id="randomized" <?php if (isset($randomized)) {
                                                                                        echo "checked";
                                                                                    } else {
                                                                                        $randomized = "off";
                                                                                    } ?> placeholder="Losowo">
                    </div>
                    <div>
                        <button type="submit" class="button" style="float: left; margin-right: 20px;">Filtruj</button>
                        <button type="button" class="button" style="float: left;" onclick="window.location.href='./logout.php';">Wyloguj</button>
                    </div>
                </form>
                <div class="memories">
                    <?php
                    include './assets/config.php';
                    $dateRange = explode(" - ", $dateRange);
                    if (sizeof($dateRange) == 2) {
                        try {
                            $dateA = strtotime($dateRange[0]);
                            $dateB = strtotime($dateRange[1]);
                            if ($dateA <= strtotime("31.12.2021") && $dateB <= strtotime("31.12.2021")) {
                                $dateA = date("Y-m-d", $dateA);
                                $dateB = date("Y-m-d", $dateB);
                                $size = mysqli_real_escape_string($conn, $size);
                                $page = mysqli_real_escape_string($conn, $page);
                                $randomized = mysqli_real_escape_string($conn, $randomized);
                                $id = $_SESSION['user_id'];
                                $offset = $size * ($page - 1);
                                if ($randomized == "on") {
                                    $sql = "SELECT memories.id AS id, memories.date AS date, memories.memory AS memory, fom.fom AS fom FROM memories LEFT JOIN fom ON DATE(memories.date)=DATE(fom.date) WHERE memories.user_id=$id AND memories.date < '$dateB' AND memories.date > '$dateA' ORDER BY RAND() DESC LIMIT $size OFFSET $offset;";
                                } else {
                                    $sql = "SELECT memories.id AS id, memories.date AS date, memories.memory AS memory, fom.fom AS fom FROM memories LEFT JOIN fom ON DATE(memories.date)=DATE(fom.date) WHERE memories.user_id=$id AND memories.date < '$dateB' AND memories.date > '$dateA' ORDER BY memories.date DESC LIMIT $size OFFSET $offset;";
                                }
                                $posts = mysqli_query($conn, $sql);
                                while ($row = mysqli_fetch_assoc($posts)) {
                                    $date = $row['date'];
                                    $memory = $row['memory'];
                                    $fom = $row['fom'];
                                    if ($fom == 2) {
                                        $fom = "<img src='./assets/happiness.png'>";
                                    } else if ($fom == 1) {
                                        $fom = "<img src='./assets/indifferent.png'>";
                                    } else if ($fom == "0") {
                                        $fom = "<img src='./assets/sad.png'>";
                                    } else {
                                        $fom = "";
                                    }
                                    echo "
                                        <div class='memory'>
                                            <h4>$date</h4>
                                            $fom
                                            <p>$memory</p>
                                        </div>
                                    ";
                                }
                            } else {
                                echo "
                                    <div class='memory'>
                                        <h4>Błąd!</h4>
                                        <p>Nieprawidłowy format daty!</p>
                                    </div>
                                    ";
                            }
                        } catch (Exception $e) {
                            echo "
                                <div class='memory'>
                                    <h4>Błąd!</h4>
                                    <p>Nieprawidłowy format daty!</p>
                                </div>
                                ";
                        }
                    } else {
                        echo "
                            <div class='memory'>
                                <h4>Błąd!</h4>
                                <p>Nieprawidłowy format daty!</p>
                            </div>
                            ";
                    }
                    ?>
                </div>
            </div>
        <?php
        }; ?>
    </div>
</body>

<!-- ParticleJS do gwiazdek -->
<script src="https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js"></script>
<script src="./assets/stars.js"></script>

</html>