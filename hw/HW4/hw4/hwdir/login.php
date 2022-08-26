<?php
header("Access-Control-Allow-Origin: *");
header('Access-Control-Allow-Headers: Content-Type');
require_once('xmlHandler.php');

// if name is not in the post data, exit
if (!isset($_POST["name"])) {
    header("Location: error.html");
    exit;
}
// if (!isset($_POST["img"])) {
//     header("Location: error.html");
//     exit;
// }

echo 'Hi '.$_POST['name'].'</br>';

// create the chatroom xml file handler
$xmlh = new xmlHandler("chatroom.xml");
if (!$xmlh->fileExist()) {
    header("Location: error.html");
    exit;
}
/////////////////////////////////////////
// handling the uploaded file image
// move all the uploaded files to the uploadsFile/
// jpg file is the only accepeted file
///////////////////////////////////////
$target_dir = "";
$file_name =  $_POST['name'] . '_' . basename($_FILES["img"]["name"]);
$target_file = $target_dir . $file_name;
$uploadOk = 1;
$imageFileType = strtolower(pathinfo($target_file,PATHINFO_EXTENSION));
$error_msg = "";
if($_FILES["img"]["size"] > 50000000){
  $error_msg = "file size too large";
  echo $error_msg.'</br>';
  $uploadOk = 0;
}
echo basename($_FILES["img"]["name"]).' ';
if($imageFileType != "jpg"){
  $error_msg = 'file type wrong, this is not jpg files';
  echo $error_msg.'</br>';
  $uploadOk = 0;
}

if($uploadOk != 0 && move_uploaded_file($_FILES["img"]["tmp_name"], $target_file)){
  rename($file_name, 'uploadsFile/'.$file_name);
  $file_name = 'uploadsFile/'.$file_name;
}

//////////////////////////////////
// name handling
/////////////////////////////////
// open the existing XML file
$xmlh->openFile();

// get the 'users' element
$users_element = $xmlh->getElement("users");

// foreach($users_element as $user){
//   echo $user->getAttribute("name");
// }
$userNodeList = $xmlh->getChildNodes('user');
$checkExistName = False;
if($uploadOk == 1){

  foreach($userNodeList as $userNode){
    $userName = $xmlh->getAttribute($userNode, 'name');
    // for debug purpose
    // if(strlen($userName) != 0){
    //   echo $userName.'<br/>';
    // }
    if($userName == $_POST['name']){
      $informUpdate = $xmlh->getAttribute($userNode, 'pic');
      $histTag = $xmlh->getAttribute($userNode, 'hist');
      if($informUpdate != null){
        $xmlh->setAttribute($userNode, "pic",$file_name);
        $xmlh->setAttribute($userNode,'hist',$histTag.'?'.$file_name.'1');
      } else {
        $xmlh->setAttribute($userNode,'hist',$file_name);
        $xmlh->setAttribute($userNode, "pic", $file_name);
      }
      $checkExistName = True;
    }
  }
  if(!$checkExistName){
    // create a 'user' element
    $user_element = $xmlh->addElement($users_element, "user");
    // add the user name
    $xmlh->setAttribute($user_element, "name", $_POST["name"]);
    $xmlh->setAttribute($user_element, "pic", $file_name);
    // add hist tag
    $xmlh->setAttribute($user_element,'hist',$file_name);
    // save the XML file
  }
  $xmlh->saveFile();

}

// // Cookie done, redirect to client.php (to avoid reloading of page from the client)
if($uploadOk == 1){
  // set the name to the cookie, if no error occur
  setcookie("name", $_POST["name"]);
  // if the uploaded file is correct redirect to client.php
  header("Location: client.php");
} else {
  echo '<b>please refresh the page and resubmit the information again!</b></br>';
  echo '<p><a href="login.html">Or You click here to Go back to the login page</a></p>';
}

?>
