<?php

// get the name from cookie
// $name = "";
// if (isset($_COOKIE["name"])) {
//     $name = $_COOKIE["name"];
// }

print "<?xml version=\"1.0\" encoding=\"utf-8\"?>";

?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
    <head>
        <title>Message Page</title>
        <link rel="stylesheet" type="text/css" href="style.css" />
        <script language="javascript" type="text/javascript">
        var loadTimer = null;
        var request;
        var datasize;
        var lastMsgID;
        var prevMessageLen = 0;

        function load() {
            console.log("I am loaded");
            var username = document.cookie;
            if (username.length == 0) {
                loadTimer = setTimeout("load()", 100);
                return;
            }

            loadTimer = null;
            datasize = 0;
            lastMsgID = 0;

            var node = document.getElementById("chatroom");
            node.style.setProperty("visibility", "visible", null);

            getUpdate();
        }

        function unload() {
            var username = document.cookie;
            if (username.length > 0) {
                //request = new ActiveXObject("Microsoft.XMLHTTP");
                request = new XMLHttpRequest();
                request.open("POST", "logout.php", true);
                request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                request.send(null);
            }
            if (loadTimer != null) {
                loadTimer = null;
                clearTimeout("load()", 100);
            }
        }

        function getUpdate() {
            //request = new ActiveXObject("Microsoft.XMLHTTP");
            console.log("I am updateed");
            request = new XMLHttpRequest();
            request.onreadystatechange = stateChange;
            request.open("POST", "server.php", true);
            // get json
            request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            request.send("datasize=" + datasize);
        }

        function stateChange() {
          console.log("keep changing");
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

            //point to the message nodes
            var messages = xmlDoc.getElementsByTagName("message");

            // create a string for the messages
            // add all messages when this is the first time to load the program
            // while if this is not thte first time to load the program, new message added to the new position,
            var node = document.getElementById("chattext");
            while(node.firstChild){
              node.removeChild(node.lastChild);
            }
            var i;
            for (var i = 0; i < messages.length; ++i) {
                var username = messages[i].getAttribute("name");
                var color = messages[i].getAttribute("color");
                console.log(color);
                console.log(username);
                showMessage(username, messages[i].textContent, color,xmlDoc);
            }
            var node = document.getElementById("chattext");

            prevMessageLen = messages.length;
        }

        function showMessage(nameStr, contentStr, color,xmlDoc) {
                var node = document.getElementById("chattext");
                var users = xmlDoc.getElementsByTagName("user");
                var userTags = '';
                for(var i = 0; i < users.length; i++){
                  var username = users[i].getAttribute("name");
                  var tags = users[i].getAttribute('tag');
                  if(username == nameStr && tags != null){
                    userTags = ' (' + tags + ') :';
                    break;
                  }
                }
                nameStr += userTags;
                // Create the name text span
                var nameNode = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
                // Set the attributes and create the text
                nameNode.setAttribute("x", 0);
                nameNode.setAttribute("dy", 20);
                nameNode.setAttribute("style", "fill:" + color);
                nameNode.appendChild(document.createTextNode(nameStr));

                // Add the name to the text node
                node.appendChild(nameNode);

                // Create the score text span]
                var conetentNode = document.createElementNS("http://www.w3.org/2000/svg", "tspan");

                // Set the attributes and create the text
                conetentNode.setAttribute("x", 400);
                conetentNode.setAttribute("style", "fill: "+ color);
                // check if there exist http / https
                if(contentStr.includes("https://" ) || contentStr.includes("http://")){
                  console.log(contentStr);
                  var indexOfHttp = contentStr.indexOf("http://");
                  var indexOfHttps = contentStr.indexOf("https://");
                  var checkString = contentStr;
                  var httpList = [];
                  while(indexOfHttp != -1 || indexOfHttps != -1){
                    var singleURL = '';
                    var i = (indexOfHttp < indexOfHttps)? ((indexOfHttp != -1)? indexOfHttp : indexOfHttps)
                            : ((indexOfHttps!=-1)? indexOfHttps : indexOfHttp);
                    while(i < checkString.length && checkString[i] != " "){
                      singleURL += checkString[i];
                      i++;
                    }
                    // get all the http substring in order
                    httpList.push(singleURL);
                    checkString = checkString.replace(singleURL,'');
                    indexOfHttp = checkString.indexOf('http://');
                    indexOfHttps = checkString.indexOf('https://');
                  }
                  console.log(httpList);
                  // check if the substring contains any http request
                  //
                  var separatedList = contentStr.split(' ');
                    for(var i = 0 ; i < separatedList.length; i++){
                      var needAppend = true;
                      for(var j = 0; j < httpList.length; j++){
                          var substrIndex = separatedList[i].indexOf(httpList[j]);
                          var normalString = '';
                          if(substrIndex != -1){
                            var a_tag = document.createElementNS("http://www.w3.org/2000/svg", "a");
                            a_tag.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", httpList[j]);
                            a_tag.setAttribute("text-decoration","underline");
                            a_tag.setAttribute("target","blank");
                            a_tag.setAttribute("style", "fill: "+ color);
                            a_tag.appendChild(document.createTextNode(httpList[j]));
                            console.log(a_tag);
                            if(substrIndex == 0){
                              conetentNode.appendChild(a_tag);
                            } else {
                              console.log(separatedList[i].split(httpList[j])[0]);
                              conetentNode.appendChild(document.createTextNode(separatedList[i].split(httpList[j])[0]));
                              conetentNode.appendChild(a_tag);
                            }
                            conetentNode.appendChild(document.createTextNode(' '));
                            needAppend = false;
                            httpList.shift();
                            break;
                        }

                      }
                      if(needAppend) conetentNode.appendChild(document.createTextNode(separatedList[i] + " "));

                    }

                  } else {
                    conetentNode.appendChild(document.createTextNode(contentStr));
                  }



                // conetentNode.innerHTML = contentStr;
                  // conetentNode.appendChild(document.createTextNode(contentStr));
                  // var a_tag = document.createElementNS("http://www.w3.org/2000/svg", "a");
                  // a_tag.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "http://google.com");
                  // a_tag.appendChild(document.createTextNode("google"));
                  //
                  // conetentNode.appendChild(a_tag);
                // Add the name to the text node
                node.appendChild(conetentNode);
        }

        </script>
    </head>

    <body style="text-align: left" onload="load()" onunload="unload()">
    <svg width="1000px" height="2000px"
     xmlns="http://www.w3.org/2000/svg"
     xmlns:xhtml="http://www.w3.org/1999/xhtml"
     xmlns:xlink="http://www.w3.org/1999/xlink"
     xmlns:a="http://www.adobe.com/svg10-extensions" a:timeline="independent"
     >

        <g id="chatroom" style="visibility:hidden">
        <rect width="1000" height="2000" style="fill:white;stroke:red;stroke-width:2"/>
        <text x="260" y="40" style="fill:red;font-size:30px;font-weight:bold;text-anchor:middle">Chat Window</text>
        <text id="chattext" y="45" style="font-size: 20px;font-weight:bold"/>
      </g>
  </svg>

<!--          <form action="">
            <input type="hidden" value="<?php print $name; ?>" id="username" />
        </form> -->

    </body>
</html>
