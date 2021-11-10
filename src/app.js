const TeleBot = require('telebot');
const CONFIG = require('./config.json');
const mysql = require('mysql');
const hash = require("./hash");
const API = 'https://thecatapi.com/api/images/get?format=src&type=';

const db_pool = mysql.createPool({
    connectionLimit: 100,
    host: CONFIG.host,
    user: CONFIG.user,
    password: CONFIG.password,
    database: CONFIG.database,
    multipleStatements: true,
    charset: "utf8mb4"

})


const bot = new TeleBot({
    token: CONFIG.botToken,
    polling: true
});

// Generowanie hasła
const random = (length = 8) => {
    let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let str = '';
    for (let i = 0; i < length; i++) {
        str += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return str;
};

// Komenda startowa. 
bot.on("/start", (msg) => {
    return bot.sendMessage(msg.from.id, 
        "<b> Witaj! </b> \n" +
        "Jeśli chciałbyś się zapisać wystarczy, że wpiszesz \"/dolacz\"\n" +
        "\n" +
        "Aby uzyskać więcej informacji na temat bota wejdź <a href=\"https://kubaczak.com/memories\">TUTAJ</a>"+
        "\n"+
        "\n<a href='tg://user?id=1447762563'>Kontakt do twórcy</a>", {parseMode: 'html'})
});
/**
 * Komenda, która służy do rejestracji. Po podaniu nazwy użytkownika generuje hasło i zapisuje informacje o użytkowniku w 
 * bazie danych. Hasło jest szyfrowane wewnętrzną funkcją SHA256. 
 */
bot.on(/^\/dolacz(?![^ ])(.*)$/, (msg, props) => {
    var sql = "SELECT * FROM users WHERE id='"+ msg.from.id +"';"
    db_pool.getConnection(function(err, connection) {
        if (err) {
            console.log("Error in connection to the database." + err);
            return bot.sendMessage(msg.from.id, "Wystąpił problem po mojej stronie ☹ Spróbuj ponownie później.");
        };
        connection.query(sql, function(err, rows){
            if (err) throw err;

            if(rows.length == 0){
                let [,nickname]=props.match[0].split(" ");
                if(nickname){
                    let sql = `SELECT * FROM users WHERE nickname=`+ connection.escape(nickname);
                    connection.query(sql, function(err, rows){
                        if(err) throw err;
                        if(rows.length == 0){
                            let db_date = new Date();
                            db_date = db_date.getUTCFullYear() + '-' +
                                ('00' + (db_date.getUTCMonth()+1)).slice(-2) + '-' +
                                ('00' + db_date.getUTCDate()).slice(-2)
                            let id = msg.from.id;
                            let password = random(16);
                            let sql = `INSERT INTO users VALUES (${id}, ` + connection.escape(nickname) + `, '${db_date}', '${hash.sha256(password)}', 1);`;
                            connection.query(sql, function(err){
                                if(err) throw err;
                                return bot.sendMessage(id, "<b>Zarejestrowano!</b> 😁\nTwoje hasło do strony internetowej to: <code>" + password + "</code> (radzę ci je szybciutko zmienić).\nTwoje wspomnienia będą widoczne <a href='https://kubaczak.com/memories'>TUTAJ</a> po upływie roku. Możesz zacząć już dziś! Napisz do mnie wspomnienie, które kojaży ci się z dzisiejszym dniem. 🤗", {parseMode: 'html'})
                            })
                        } else {
                            return bot.sendMessage(msg.from.id, "Ta nazwa użytkownika jest już zajęta! Muszisz wybrać sobie inną.");
                        }
                    });
                } else {
                    return bot.sendMessage(msg.from.id, "Aby się zapisać musisz podać swój pseudonim!\nUżyj:\n<code>/dolacz (pseudonim)</code>", {parseMode: 'html'});
                }
            } else {
                return bot.sendMessage(msg.from.id, "Jesteś już zapisany 😉 Jeśli chcesz się wypisać kliknij <code>/wypisz</code>", {parseMode: 'html'});
            }
        })
        connection.release();
    });

})

/**
 * Komenda służąca do wyrejestrowania się. Gdy użytkownik się wyrejestruje, wszelkie jego dane zostaną usuniętę.
 */
bot.on(/\/wypisz(?![^ ])(.*)$/, (msg, props) => {
    var sql = "SELECT * FROM users WHERE id='"+ msg.from.id +"';"
    db_pool.getConnection(function(err, connection) {
        if (err) {
            console.log("Error in connection to the database." + err);
            return bot.sendMessage(msg.from.id, "Wystąpił problem po mojej stronie ☹ Spróbuj ponownie później.");
        };
        connection.query(sql, function(err, rows, fields){
            if (err) throw err;

            if(rows.length != 0){
                let [,accept]=props.match[0].split(" ");
                if(accept){
                    accept = accept.toLowerCase()
                    if(accept == "potwierdz"){
                        let id = msg.from.id;
                        let sql = `DELETE FROM users WHERE id=${id}; DELETE FROM memories WHERE user_id=${id}; DELETE FROM fom WHERE user_id=${id}`;
                        connection.query(sql, function(err){
                            if(err) throw err;
                            return bot.sendMessage(id, "<b>Wyrejestrowano</b> 😔\nMam nadzieję, że kiedyś znów mnie odwiedzisz.", {parseMode: 'html'})
                        })
                    } else {
                        return bot.sendMessage(msg.from.id, "Na pewno chcesz się wypisać? Utracisz wszystie wspomnienia i nie będziesz mógł tego cofnąć! Wpisz <code>/wypisz potwierdz</code>", {parseMode: 'html'});
                    }  
                } else {
                    return bot.sendMessage(msg.from.id, "Na pewno chcesz się wypisać? Utracisz wszystie wspomnienia i nie będziesz mógł tego cofnąć! Wpisz <code>/wypisz potwierdz</code>", {parseMode: 'html'});
                }
                
            } else {
                return bot.sendMessage(msg.from.id, "Nie jesteś zapisany. Wpisz <code>/dolacz</code>, aby się zapisać.", {parseMode: 'html'});
            }
        })
    });
})

/**
 * Zapisywanie wspomnienia użytkownika. Regex wykrywa wszelki tekst, który nie jest komendą i nie jest
 * informacją o samopoczuciu. Gdy użytkownik wysłał wspomnienie tego dnia, nie będzie mógł wysłać
 * drugiego. Maksymalna długość wspomnienia to 4096 znaków (limit znaków wiadomości na telegramie)
 */
bot.on(/^(?!(\/dolacz|\/start|\/wypisz|\/usunwspomnienie)).*/, (msg) => {
    if(["dobrze", "średnio", "źle"].indexOf(msg.text.toLowerCase()) > -1){
        return;
    }
    var sql = "SELECT * FROM users WHERE id='"+ msg.from.id +"';"
    db_pool.getConnection(function(err, connection) {
        if (err) {
            console.log("Error in connection to the database." + err);
            return bot.sendMessage(msg.from.id, "Wystąpił problem po mojej stronie ☹ Spróbuj ponownie później.");
        };
        connection.query(sql, function(err, rows){
            if (err) throw err;
            if(rows.length != 0){
                let db_date = new Date();
                db_date = db_date.getUTCFullYear() + '-' +
                    ('00' + (db_date.getUTCMonth()+1)).slice(-2) + '-' +
                    ('00' + db_date.getUTCDate()).slice(-2);
                let sql = `SELECT * FROM memories WHERE user_id=${msg.from.id} AND date BETWEEN '${db_date} 00:00:00' AND '${db_date} 23:59:59'`;
                connection.query(sql, function(err, rows){
                    if (err) throw err;
                    if(rows.length == 0){
                        let db_date = new Date();
                        db_date = db_date.getUTCFullYear() + '-' +
                            ('00' + (db_date.getUTCMonth()+1)).slice(-2) + '-' +
                            ('00' + db_date.getUTCDate()).slice(-2) + ' ' + 
                            ('00' + db_date.getUTCHours()).slice(-2) + ':' + 
                            ('00' + db_date.getUTCMinutes()).slice(-2) + ':' + 
                            ('00' + db_date.getUTCSeconds()).slice(-2);
                        let sql = `INSERT INTO memories (user_id, memory, date) VALUES (${msg.from.id}, ` + connection.escape(msg.text) + `, '${db_date}')`;
                        connection.query(sql, function(err){
                            if(err) throw err;
                            return bot.sendMessage(msg.from.id, "Zapisałem twoje dzisiejsze wspomnienie 😁");
                        })
                    } else {
                        return bot.sendMessage(msg.from.id, "Wysłałeś już dzisiejsze wspomnienie. Aby je zmienić musisz najpierw usunąć poprzednie \n<code>/usunwspomnienie</code>", {parseMode: 'html'})
                    }
                })
            } else {
                return bot.sendMessage(msg.from.id, "Nie jesteś zapisany. Wpisz <code>/dolacz</code>, aby się zapisać.", {parseMode: 'html'});
            }
        })
    });
    return;
})

/**
 * Komenda służąca do usunięcią wspomnienia użytkownika z aktualnego dnia.
 * Komenda usuwa wspomnienie i informacje o samopoczuciu.
 * Działa niezależnie, czy użytkownik jest zapisany, czy nie.
 */
bot.on('/usunwspomnienie', (msg) => {
    db_pool.getConnection(function(err, connection) {
        let db_date = new Date();
        db_date = db_date.getUTCFullYear() + '-' +
            ('00' + (db_date.getUTCMonth()+1)).slice(-2) + '-' +
            ('00' + db_date.getUTCDate()).slice(-2);
        let sql = `DELETE FROM memories WHERE user_id=${msg.from.id} AND date BETWEEN '${db_date} 00:00:00' AND '${db_date} 23:59:59'; DELETE FROM fom WHERE user_id=${msg.from.id} AND date BETWEEN '${db_date} 00:00:00' AND '${db_date} 23:59:59'`;
        connection.query(sql, function(err){
            if (err) throw err;
            return bot.sendMessage(msg.from.id, "Usunąłem twoje dzisiejsze wspomnienie i informacje o samopoczuciu (Jeśli je dodałeś 😉).")
        })
    })
})

/**
 * Gdy użytkownik wpisze jedno z trzech słów (dobrze, źle lub średnio),
 * wysyła informacje o samopoczuciu do bazy danych. Gdy użytkownik wybierze
 * samopoczucie inne niż dobrze, bot wyśle do użytkownika losowe zdjęcie kota
 * z TheCatApi. Regex wykrywa te 3 słowa niezależnie od wielkości liter.
 */
bot.on(/^(dobrze|źle|średnio)/i, (msg) => {
    db_pool.getConnection(function(err, connection) {
        if (err) {
            console.log("Error in connection to the database." + err);
            return bot.sendMessage(msg.from.id, "Wystąpił problem po mojej stronie ☹ Spróbuj ponownie później.");
        };
        var sql = "SELECT * FROM users WHERE id='"+ msg.from.id +"';"
        connection.query(sql, function(err, rows){
            if (err) throw err;
            if(rows.length != 0){
                let db_date = new Date();
                db_date = db_date.getUTCFullYear() + '-' +
                    ('00' + (db_date.getUTCMonth()+1)).slice(-2) + '-' +
                    ('00' + db_date.getUTCDate()).slice(-2);
                let sql = `SELECT * FROM fom WHERE user_id=${msg.from.id} AND date BETWEEN '${db_date} 00:00:00' AND '${db_date} 23:59:59'`;
                connection.query(sql, function(err, rows){
                    if (err) throw err;
                    if(rows.length == 0){
                        let db_date = new Date();
                        db_date = db_date.getUTCFullYear() + '-' +
                            ('00' + (db_date.getUTCMonth()+1)).slice(-2) + '-' +
                            ('00' + db_date.getUTCDate()).slice(-2) + ' ' + 
                            ('00' + db_date.getUTCHours()).slice(-2) + ':' + 
                            ('00' + db_date.getUTCMinutes()).slice(-2) + ':' + 
                            ('00' + db_date.getUTCSeconds()).slice(-2);
                        switch (msg.text.toLowerCase()){
                            case "dobrze":
                                fom = 2
                                break;
                            case "średnio":
                                fom = 1
                                break;
                            case "źle":
                                fom = 0
                                break;
                        }
                        let sql = `INSERT INTO fom (user_id, fom, date) VALUES (${msg.from.id}, ${fom}, '${db_date}')`;
                        connection.query(sql, function(err){
                            if(err) throw err;
                            if(fom == 2)
                                return bot.sendMessage(msg.from.id, "<b>Zapisałem twoje dzisiejsze samopoczucie</b> 😁\nTeraz możesz mi opowiedzieć o swoim dniu, jeśli jeszcze tego nie zrobiłeś.", {parseMode: 'html'});
                            if(fom == 1 || fom == 0){
                                bot.sendMessage(msg.from.id, "Przykro mi to słyszeć 😔 Mam nadzieję, że zdjęcie tego kotka poprawi ci humor 😸 Później będziesz mógł opisać mi swój dzień, jeśli jeszcze tego nie zrobiłeś.");
                                let promise;
                                let id = msg.from.id;
                                promise = bot.sendPhoto(id, API + 'jpg', {
                                    fileName: 'kitty.jpg',
                                    serverDownload: true
                                });
                                bot.sendAction(id, 'upload_photo');
                                return promise.catch(error => {
                                    console.log('[error]', error);
                                    bot.sendMessage(id, `😿 Wystąpił błąd ${ error }. Skontaktuj się z moim stwórcom i zgłoś ten problem, proszę.`);
                                });
                            }
                        })
                    } else {
                        return bot.sendMessage(msg.from.id, "Wysłałeś już dzisiejsze samopoczucie. Aby je zmienić musisz najpierw usunąć poprzednie \n<code>/usunwspomnienie</code>", {parseMode: 'html'})
                    }
                })
            } else {
                return bot.sendMessage(msg.from.id, "Nie jesteś zapisany.\nWpisz <code>/dolacz</code>, aby się zapisać.", {parseMode: 'html'});
            }
        })
    });
    return;
})

/**
 * Funkcja wybiera z bazy danych id użytkowników, którzy nie wysłali wspomnienia, lub samopoczucia z
 * aktualnego dnia i wysyła do nich przypomnienie każdego dnia o godzinie 21:00.
 */
function przypomnienie(){
    db_pool.getConnection(function(err, connection){
        if (err) {
            console.log("Error in connection to the database." + err);
            return bot.sendMessage(msg.from.id, "Wystąpił problem po mojej stronie ☹ Spróbuj ponownie później.");
        };
        let db_date = new Date();
        db_date = db_date.getUTCFullYear() + '-' +
            ('00' + (db_date.getUTCMonth()+1)).slice(-2) + '-' +
            ('00' + db_date.getUTCDate()).slice(-2)
        let sql = `SELECT users.id FROM users WHERE NOT users.id IN (SELECT fom.user_id FROM fom WHERE fom.date BETWEEN '${db_date} 00:00:00' AND '${db_date} 23:59:59');`
        connection.query(sql, function(err, rows){
            if(err) throw err;
            for(i in rows){
                bot.sendMessage(rows[i].id, "<b>Witaj!</b> 🤗\nWygląda na to, że nie uzupełniłeś informacji o swoim dzisiejszym samopoczuciu, więc jestem tu, aby ci o tym przypomnieć! Jak się dziś czujesz? Dobrze, źle czy średnio?", {parseMode: "html"})
            }
        });
        sql = `SELECT users.id FROM users WHERE users.id IN (SELECT fom.user_id FROM fom WHERE fom.date BETWEEN '${db_date} 00:00:00' AND '${db_date} 23:59:59') AND NOT users.id IN (SELECT memories.user_id FROM memories WHERE memories.date BETWEEN '${db_date} 00:00:00' AND '${db_date} 23:59:59');`
        connection.query(sql, function(err, rows){
            if(err) throw err;
            for(i in rows){
                bot.sendMessage(rows[i].id, "<b>Witaj!</b> 🤗\nJeszcze nie zapisałeś dzisiejszego wspomnienia. Pamiętaj o tym, zanim uśniesz inaczej zapomnisz o tym dniu. (To by było straszne 😱)", {parseMode: "html"})
            }
        });
    });  
};


/**
 * Funkcja wylicza czas do 21:00 w danym dniu lub jeśli jest po 21:00 w dniu następnym,
 * i uruchamia funkcję przypomnienie() o tej godzinie, po czym ustawia interwał, by funkcja
 * ta uruchamiał się co 24 godziny.
 */
function timeEvents() {
    const now = new Date()
    let start;
    let wait;

    if (now.getHours() < 21) {
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 21, 0, 0, 0);
    } else {
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 21, 0, 0, 0);
    }

    wait = start.getTime() - now.getTime();

    if(wait <= 0) {
        console.log('Coś się popsuło...');
        timeEvents();
    } else {
        setTimeout(function () {
            przypomnienie();
            setInterval(function () {
                przypomnienie();
            }, 86400000);
        }, wait);
    }
}
timeEvents()

/**
 * Wypisanie błędów bota do konsoli
 */
bot.on('error', (err) =>{
    console.log(err);
})

/**
 * Gdy bot z jakiegoś powodu się wyłączy, włącza go automatycznie po 5 sekundach.
 */
bot.on('stop', (data) => {
    console.log("Ponowne uruchamianie bota.");
    setTimeout(function(){ bot.start(); bindEvents() }, 5 * 1000);
});

// Uruchomienie bota.
bot.start()
