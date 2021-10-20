# IMPORTS
import threading
import telebot
import mysql.connector
from time import sleep


# BOT DATA
BOT_TOKEN = ""
BOT_INTERVAL = 3
BOT_TIMEOUT = 30

# MYSQL DATA
DB_HOST = "ssh.kubaczak.com"
DB_USER = ""
DB_PASSWORD = ""
DB_NAME = ""
DB_CHARSET = "utf8"

# CREATING BOT AND BINDING ACTIONS
def bot_polling():
    print("STARTING PROGRAM")
    # CREATING BOT AFTER ERROR
    endBot = True
    while endBot:
        try:
            print("Starting bot instance")
            bot = telebot.telebot(BOT_TOKEN)
            botactions()
            bot.polling(none_stop=True, interval=BOT_INTERVAL, timeout=BOT_TIMEOUT)
        except Exception as ex:
            print("Something went wrong :( (" + ex + ") Restarting...")
            bot.stop_polling()
            sleep(BOT_TIMEOUT)
        else:
            bot.stop_polling()
            print("Shutting down...")
            endBot = False

# BOT FUNCTIONS
def botactions():
    # help message
    @bot.message_handler(commands=["start", "help", "pomoc"])
    def command_start(msg):
        bot.send_message(msg.from_user.id, "<b> Witaj! </b> \n"+
                                           "Jeśli chciałbyś się zapisać wystarczy, że wpiszesz \"/dolacz\"\n"
                                           "\n"
                                           "Aby uzyskać więcej informacji na temat bota wejdź <a href=\"https://kubaczak.com/memories\">TUTAJ</a>")

    # join message
    @bot.message_handler(commands=["dolacz", "join", "wlacz"])
    def command_join(msg):
        pass

# RECURRING ACTIONS
def time_events():
    pass

# MAIN LOOP
if __name__ == "__main__":

    # POLLING THRED FOR BOT
    polling_thread = threading.Thread(target=bot_polling)
    polling_thread.daemon = True
    polling_thread.start()

    # POLLING THRED FOR RECURRING ACTIONS
    time_events_thread = threading.Thread(target=time_events)
    time_events_thread.daemon = True
    time_events_thread.start()

    end = True
    while end:
        try:
            sleep(120)
        except KeyboardInterrupt:
            end = False
