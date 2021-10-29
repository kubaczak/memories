const TeleBot = require('telebot');

const bot = new TeleBot({
    token:'',
    polling:true
});



bot.on('stop', (data) => {
    setTimeout(function(){ bot.start() }, 5 * 1000);
});