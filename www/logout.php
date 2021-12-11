<?php
unset($_SESSION['user_id']);
session_write_close();
header("Location: index.php");
