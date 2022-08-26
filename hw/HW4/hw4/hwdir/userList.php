<?php

// get the name from cookie
// $name = "";
if (isset($_COOKIE["name"])) {
    $name = $_COOKIE["name"];
} else {
  header("Location: error.html");
}

print "<?xml version=\"1.0\" encoding=\"utf-8\"?>";

?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
    <head>
      <style>
                table {
            font-family: arial, sans-serif;
            border-collapse: collapse;
            width: 100%;
          }

          td, th {
            border: 1px solid #dddddd;
            text-align: center;
            padding: 8px;
          }

          tr:nth-child(even) {
            background-color: #dddddd;
          }
      </style>
        <title>User list</title>
        <link rel="stylesheet" type="text/css" href="style.css" />
        <script language="javascript" type="text/javascript">
        var loadTimer = null;
        var request;
        var datasize;
        var lastMsgID;
        var prevMessageLen = 0;

        function load() {
          console.log("hiigi");

            var username = document.cookie;
            if (username.length == 0) {
                loadTimer = setTimeout("load()", 100);
                return;
            }

            loadTimer = null;
            datasize = 0;
            lastMsgID = 0;

            getUpdate();
        }

        function unload() {
            if (loadTimer != null) {
                loadTimer = null;
                clearTimeout("load()", 100);
            }
        }

        function getUpdate() {
            var hasCookie = document.cookie;
            console.log("cookie number is " + hasCookie);
            if(hasCookie == 0){
              console.log('no cookie');
              var table = document.getElementById('userListTable');
              table.style.visibility = 'hidden';
              alert('You have logged out! Please log in to view the user list!');
              load();
              return;
            }
            //request = new ActiveXObject("Microsoft.XMLHTTP");
            request = new XMLHttpRequest();
            request.onreadystatechange = stateChange;
            request.open("POST", "userServer.php", true);
            // get json
            request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            request.send("datasize=" + datasize);

        }

        function stateChange() {
            if (request.readyState == 4 && request.status == 200 && request.responseText) {
                var xmlDoc;
                var parser = new DOMParser();
                // provides the ability to parse html and xml using DOm parser that converst all the text into DOM
                xmlDoc = parser.parseFromString(request.responseText, "text/xml");
                // the server response is serveral texts, while those texts can be parsered into Dom to do operation
                // easily
                datasize = request.responseText.length;

                updateChat(xmlDoc);
                getUpdate();
            }
        }

        function updateChat(xmlDoc) {
            var table = document.getElementById('userListTable');
            table.style.visibility = 'visible';
            //point to the message nodes
            var users = xmlDoc.getElementsByTagName("user");
            // create a string  for the messages
            // add all messages when this is the first time to load the program
            // while if this is not thte first time to load the program, new message added to the new position,
            var i;
            for (i = prevMessageLen; i < users.length; ++i) {
                var username = users[i].getAttribute("name");
                var picture = users[i].getAttribute("pic");
                insertTable(username, picture);
            }
            prevMessageLen = users.length;
        }

        function insertTable(nameStr, picture) {
            console.log(picture);
            var table = document.getElementById('userListTable');
                table.style.visibility = 'visible';
                var tr = document.createElement('tr');
                var td1 = document.createElement('td');
                var td2 = document.createElement('td');
                var userIcon = document.createElement("IMG");
                userIcon.setAttribute("src", picture);
                userIcon.setAttribute("width", 50);
                userIcon.setAttribute("height", 50);
                userIcon.setAttribute("alt", nameStr+"'s picture");
                var text2 = document.createTextNode(nameStr);
                td1.appendChild(userIcon);
                td2.appendChild(text2);
                tr.appendChild(td1);
                tr.appendChild(td2);
                table.appendChild(tr);

        }

        </script>
    </head>

    <body style="text-align: center" onload="load()" onunload="unload()">
      <table id="userListTable">
        <tr>
          <th>Picture</th>
          <th>Name</th>
        </tr>
      </table>

<!--          <form action="">
            <input type="hidden" value="<?php print $name; ?>" id="username" />
        </form> -->

    </body>
</html>
