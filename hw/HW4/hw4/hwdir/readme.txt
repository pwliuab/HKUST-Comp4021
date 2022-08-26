：） Welcome to Paul's chatroom user guide
1. directory -> using xampp, under htdocs
	- Place folder hwdir to htdocs
	- enter localhost/hwdir/ to go to index page
2. Log in function -> written in login.html
	-  entering valid username any combination of numbers, English character and "_"
	-  and select a jpg image file
	- if you type invalid name, alert will be shown
	- if you submit wrong image type, customized erro page will be shown on the lower frame
3. userList -> directly related file userList.php, userServer.php, xmlHandler.php
	- Click show userlist button
	- Please wait patiently, it may take time to load pictures and table.
	- once there is no cookie, it will log out after serveral seconds
	- it will be shown once there is cookie
4. add tag -> directly related file add_tag.php xmlHandler.php
	- press add tag to get input field and submit button
	- once clickig submit button , input field and submit button will be disappeared
	- at most three tag can be added : oldest one will be removed if more than 3 (Leftest one is the oldest)
	- all the message including previous messages will be updated to the tag
	- please do not enter "," since it may interrupt with the algorithm
	- empty tag will not be added to the tag, it will just ignore it.
	- it may take time to load sometimes, system need to get response from the php files.
5. url function -> written in client.php
	- all substring contains http:// will be underlined all the way program read " " space.
	- underlined message will be the url link to the same string that is underlined
	- "," cannot be underlined
	- example: 
		- xxxxhttp://www.4399.com -> http://www.4399.com will be underline and add a hypertext link to http://www.4399.com
		- http://www.4399.com -> http://www.4399.com will be underline and add a hypertext link to http://www.4399.com
		- http://www.4399.comxxxxx -> http:www.4399.comxxxxx will be underlined and link to http://www.4399.comxxxxxxxxxx
		- http://www.4399.comhttps://www.4399.com -> this whole sentence will be underlined and link to http://www.4399.comhttps://www.4399.com	 
6. log out -> logout.php
	- clear cookie
	- redirect to the login page

7. User interface
	- please do not enter long string, since they may overlap with each other :),
	- no time to do more customization :( but i will do it after exam..

:) Thank you for your grading. I spent a lot of time on improving the details of the website, hope you enjoy using it~