<?php

require_once('xmlHandler.php');

if (!isset($_COOKIE["name"])) {
    header("Location: error.html");
    exit;
}

// create the chatroom xml file handler
$xmlh = new xmlHandler("chatroom.xml");
if (!$xmlh->fileExist()) {
    header("Location: error.html");
    exit;
}

setcookie("name", "", time() - 3600);

header("Location: login.html");

?>
