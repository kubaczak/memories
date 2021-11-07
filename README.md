# My Memories Cards
Bot do telegrama stworzony w JS przy pomocy biblioteki [TeleBot](https://github.com/mullwar/telebot "TeleBot").

Każdego dnia zapisuje wspomnienia użytkownika w bazie danych. Wspomnienia te nie będą dostępne dla użytkownika do końca roku. Wspomnienia z poprzedniego roku będą wyświetlane na [stronie internetowej](https://kubaczak.com/memories "stronie internetowej").

Bot zbiera również informacje o samopoczuciu i w przypadku, gdy użytkownik poinformuje bota o słabym samopoczuciu, wyśle mu losowe zdjęcie kotka.

##Instalacja
```
$ yarn install
```
Należy również w folderze src utworzyć plik config.json i uzupełnić informacje
```
{
    "botToken": "",
    "host": "",
    "user": "",
    "password": "",
    "database": ""
}
```
