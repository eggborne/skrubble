<?php
	include("config.php");

	$postData = json_decode(file_get_contents("php://input"), TRUE);
  $userId = $postData['userId'];
  $opponentId = $postData['opponentId'];

  $updateUserSql = "UPDATE `visitors` SET currentOpponentId='$opponentId' WHERE visitorId='$userId';";
  $updateOpponentSql = "UPDATE `visitors` SET currentOpponentId='$userId' WHERE visitorId='$opponentId';";
  $updateUserResult = mysqli_query($link,$updateUserSql);
  $updateOpponentResult = mysqli_query($link,$updateOpponentSql);

  if($updateUserResult && $updateOpponentResult){
    echo "Updated user and opponent with currentOpponentId.";
  }else{
    if(!$updateUserResult) {
      echo "Could not update user. ";
    }
    if(!$updateOpponentResult) {
      echo "Could not update opponent. ";
    }
  }
	mysqli_close($link);
?>