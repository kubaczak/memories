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
        ?>

            <form action="test.php" method="GET" class="settings">
                <input type="text" name="dateRange" id="datePicker" placeholder="Wybierz zakres czasu">
                <button type="submit" class="button">Filtruj</button>
            </form>

        <?php
        }; ?>
    </div>
</body>

<!-- ParticleJS do gwiazdek -->
<script src="https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js"></script>
<script src="./assets/stars.js"></script>

</html>