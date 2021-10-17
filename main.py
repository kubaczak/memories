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


if __name__ == "__main__":
    end = True
    while end:
        try:
            sleep(120)
        except KeyboardInterrupt:
            end = False
