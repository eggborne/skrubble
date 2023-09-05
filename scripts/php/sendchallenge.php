<?php
	include("config.php");

	$postData = json_decode(file_get_contents("php://input"), TRUE);
	$visitorId = $postData['visitorId'];
  $opponentId = $postData['opponentId'];
  $status = $postData['status'];

  $updateOpponentSql = "UPDATE `visitors` SET challenger='$visitorId' WHERE visitorId='$opponentId';";
  $updateOpponentResult = mysqli_query($link,$updateOpponentSql);

  if($updateOpponentResult){
    echo "Updated opponent with challenger.";
  }else{
    echo "Could not update opponent. ";
  }
	mysqli_close($link);
?>