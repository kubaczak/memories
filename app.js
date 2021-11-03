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
/**
bot.on('text', function(msg){
    console.log(`[text] ${msg.chat.id} ${ msg.text } `)
})
*/
bot.on(['/start', '/help', '/pomoc', '/info'], (msg) => {
    return bot.sendMessage(msg.from.id, 
        "<b> Witaj! </b> \n" +
        "Jeśli chciałbyś się zapisać wystarczy, że wpiszesz \"/dolacz\"\n" +
        "\n" +
        "Aby uzyskać więcej informacji na temat bota wejdź <a href=\"https://kubaczak.com/memories\">TUTAJ</a>", {parseMode: 'html'})
});


bot.on(/^\/dolacz(?![^ ])(.*)$/, (msg, props) => {
    var sql = "SELECT * FROM users WHERE id='"+ msg.from.id +"';"
    db_pool.getConnection(function(err, connection) {
        if (err) {
            console.log("Error in connection to the database." + err);
            return bot.sendMessage(msg.from.id, "Wystąpił problem po mojej stronie ☹ Spróbuj ponownie później.");
        };
        connection.query(sql, function(err, rows, fields){
            if (err) throw err;

            if(rows.length == 0){
                //console.log(props) 
                let [,nickname,fom]=props.match[0].split(" ");
                if(nickname&&fom){
                    fom = fom.toLowerCase()
                    if(fom == "tak" || fom == "nie"){
                        let db_date = new Date();
                        db_date = db_date.getUTCFullYear() + '-' +
                            ('00' + (db_date.getUTCMonth()+1)).slice(-2) + '-' +
                            ('00' + db_date.getUTCDate()).slice(-2) + ' ' + 
                            ('00' + db_date.getUTCHours()).slice(-2) + ':' + 
                            ('00' + db_date.getUTCMinutes()).slice(-2) + ':' + 
                            ('00' + db_date.getUTCSeconds()).slice(-2);
                        let id = msg.from.id;
                        let password = random(16);
                        let sql = `INSERT INTO users VALUES (${id}, '${escape(nickname)}', '${db_date}', ${fom=='tak'?1:0}, '${password}', 1);`;
                        connection.query(sql, function(err){
                            if(err) throw err;
                            return bot.sendMessage(id, "<b>Zarejestrowano!</b> 😁\nTwoje hasło do strony internetowej to: <code>" + password + "</code> (radzę ci je szybciutko zmienić).\nTwoje wspomnienia będą widoczne <a href='https://kubaczak.com/memories'>TUTAJ</a> po upływie roku. Możesz zacząć już dziś! Napisz do mnie wspomnienie, które kojaży ci się z dzisiejszym dniem. 🤗", {parseMode: 'html'})
                        })
                    } else {
                        return bot.sendMessage(msg.from.id, "Aby się zapisać musisz podać swój pseudonim oraz to czy chcesz zbierać informacje o swoim samopoczuciu! \nUżyj:\n<code>/dolacz (pseudonim) (tak/nie)</code>", {parseMode: 'html'});
                    }  
                } else {
                    return bot.sendMessage(msg.from.id, "Aby się zapisać musisz podać swój pseudonim oraz to czy chcesz zbierać informacje o swoim samopoczuciu! \nUżyj:\n<code>/dolacz (pseudonim) (tak/nie)</code>", {parseMode: 'html'});
                }
                
            } else {
                return bot.sendMessage(msg.from.id, "Jesteś już zapisany 😉 Jeśli chcesz się wypisać kliknij /wypisz");
            }
        })
    });
})

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
                        let sql = `DELETE FROM users WHERE id=${id};`;
                        connection.query(sql, function(err){
                            if(err) throw err;
                            return bot.sendMessage(id, "<b>Wyrejestrowano</b> 😔\nMam nadzieję, że kiedyś znów mnie odwiedzisz.", {parseMode: 'html'})
                        })
                    } else {
                        return bot.sendMessage(msg.from.id, "Na pewno chcesz się wypisać? Utracisz wszystie wspomnienia i nie będziesz mógł tego cofnąć! Wpisz /wypisz potwierdz");
                    }  
                } else {
                    return bot.sendMessage(msg.from.id, "Na pewno chcesz się wypisać? Utracisz wszystie wspomnienia i nie będziesz mógł tego cofnąć! Wpisz /wypisz potwierdz");
                }
                
            } else {
                return bot.sendMessage(msg.from.id, "Nie jesteś zapisany. Wpisz /dolacz, aby się zapisać.");
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