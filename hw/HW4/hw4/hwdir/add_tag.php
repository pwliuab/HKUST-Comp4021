<?php

require_once('xmlHandler.php');
// check whether user has logged in
if (!isset($_COOKIE["name"])) {
    header("Location: error.html");
    return;
}
// get the name from cookie
$name = $_COOKIE["name"];

// get the message content
$tag = $_POST["tag"];

// create the chatroom xml file handler
$xmlh = new xmlHandler("chatroom.xml");
//check if the file exist in the folder
if (!$xmlh->fileExist()) {
    header("Location: error.html");
    exit;
}
if($tag == ''){

  header("Location: client.php");
  return;
}

$xmlh->openFile();
// get the 'users' element
$users_element = $xmlh->getElement("users");
$userNodeList = $xmlh->getChildNodes('user');
foreach($userNodeList as $userNode){
  $userName = $xmlh->getAttribute($userNode, 'name');
  if($userName == $name){
    $previousTag = $xmlh->getAttribute($userNode, 'tag');
    $updateTag = $xmlh->getAttribute($userNode, 'update');
    // give it update tag to change the length of the message
    if($updateTag != null){
      $xmlh->setAttribute($userNode, "update",$updateTag.'-1');
    } else {
      $xmlh->setAttribute($userNode, "update",'-1');
    }
    if($previousTag != null){
      $tag_list = explode(",", $previousTag);
      print_r ($tag_list);
      if(sizeof($tag_list) == 3){
        array_shift($tag_list);
        echo var_dump($tag_list);
        $tagstr = '';
        foreach($tag_list as $tagitem){
          if($tagstr == ''){
            $tagstr = $tagitem;
            continue;
          }
          $tagstr = $tagstr.','.$tagitem;
        }
        $xmlh->setAttribute($userNode, "tag",$tagstr.','.$tag);
      } else {
        $xmlh->setAttribute($userNode, "tag",$previousTag.','.$tag);
      }

    } else {
      echo $tag;
      $xmlh->setAttribute($userNode, "tag", $tag);
    }
  }
}

$xmlh->saveFile();
//
header("Location: client.php");


?>
