const TeleBot = require('telebot');
const CONFIG = require('./config.json');
var mysql = require('mysql');

const db_pool = mysql.createPool({
    connectionLimit: 100,
    host: CONFIG.host,
    user: CONFIG.user,
    password: CONFIG.password,
    database: CONFIG.database
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

bot.on('text', function(msg){
    console.log(`[text] ${msg.chat.id} ${ msg.text } `)
})

bot.on(['/start', '/help', '/pomoc', '/info'], (msg) => {
    console.log("Coś tam napisali")
    return bot.sendMessage(msg.from.id, 
        "<b> Witaj! </b> \n" +
        "Jeśli chciałbyś się zapisać wystarczy, że wpiszesz \"/dolacz\"\n" +
        "\n" +
        "Aby uzyskać więcej informacji na temat bota wejdź <a href=\"https://kubaczak.com/memories\">TUTAJ</a>")
});


bot.on(/^\/dolacz (.+)$/, (msg, props) => {
    var sql = "SELECT * FROM users WHERE id='"+ msg.from.id +"';"
    db_pool.getConnection(function(err, connection) {
        if (err) {
            connection.release();
            console.log("Error in connection to the database." + err);
            return bot.sendMessage(msg.from.id, "Wystąpił problem po mojej stronie ☹ Spróbuj ponownie później.");
        };
        connection.query(sql, function(err, rows, fields){
            if (err) throw err;

            if(rows.length == 0){
                if(props.length > 0){
                    let prop = props.match[1].split(" ");
                    if(prop.length == 2){
                        if(prop[1].toLowerCase() == "tak" || prop[1].toLowerCase() == "nie"){
                            let nickname = prop[0];
                            let fom = prop[1].toLowerCase() == "tak" ? 1 : 0;
                            let db_date = new Date();
                            db_date = db_date.getUTCFullYear() + '-' +
                                ('00' + (db_date.getUTCMonth()+1)).slice(-2) + '-' +
                                ('00' + db_date.getUTCDate()).slice(-2) + ' ' + 
                                ('00' + db_date.getUTCHours()).slice(-2) + ':' + 
                                ('00' + db_date.getUTCMinutes()).slice(-2) + ':' + 
                                ('00' + db_date.getUTCSeconds()).slice(-2);
                            let id = msg.from.id;
                            let password = random(16);
                            let sql = "INSERT INTO users VALUES (" + id + ", '" + escape(nickname) + "', '" + db_date + "', " + fom + ", '" + password + "');";
                            connection.query(sql, function(err){
                                if(err) throw err;
                                return bot.sendMessage(id, "Zarejestrowano! Twoje hasło do strony internetowej to: " + password + " (radzę ci je szybciutko zmienić). Twoje wspomnienia będą widoczne na stronie https://kubaczak.com/memories po upływie roku. Możesz zacząć już dziś! Napisz do mnie wspomnienie, które kojaży ci się z dzisiejszym dniem.")
                            })
                        } else {
                            return bot.sendMessage(msg.from.id, "Aby się zapisać musisz podać swój pseudonim oraz to czy chcesz zbierać informacje o swoim samopoczuciu! \nUżyj:\n/dolacz (pseudonim) (tak/nie)");
                        }
                    } else {
                        return bot.sendMessage(msg.from.id, "Aby się zapisać musisz podać swój pseudonim oraz to czy chcesz zbierać informacje o swoim samopoczuciu! \nUżyj:\n/dolacz (pseudonim) (tak/nie)");
                    }
                } else {
                    return bot.sendMessage(msg.from.id, "Aby się zapisać musisz podać swój pseudonim oraz to czy chcesz zbierać informacje o swoim samopoczuciu! \nUżyj:\n/dolacz (pseudonim) (tak/nie)");
                }
            } else {
                console.log(rows.length)
                return bot.sendMessage(msg.from.id, "Jesteś już zapisany 😉 Jeśli chcesz się wypisać kliknij /wypisz");
            }
        })
    });
})

bot.on('error', (err) =>{
    console.log(err);
})

bot.on('stop', (data) => {
    console.log("Ponowne uruchamianie bota.");
    setTimeout(function(){ bot.start(); bindEvents() }, 5 * 1000);
});

bot.start()