<?php
	include("config.php");

	$postData = json_decode(file_get_contents("php://input"), TRUE);
	$gameSessionId = $postData['gameSessionId'];

  $retrieveSql = "SELECT * FROM `game-sessions` WHERE ind='$gameSessionId';";

  $retrieveResult = mysqli_query($link,$retrieveSql);

  if($retrieveResult){
    while($row=mysqli_fetch_assoc($retrieveResult)){
      $rows[] = $row;
    }
    echo json_encode([$rows]);
  } else {
    echo 'Game session could not update.';
  }
  
	mysqli_close($link);
?>