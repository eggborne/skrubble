<?php
	include("config.php");

	$postData = json_decode(file_get_contents("php://input"), TRUE);
	$visitorId = $postData['visitorId'];
	$status = $postData['status'];

  $updateSql = "UPDATE `visitors` SET timeSinceLastPoll=(UTC_TIMESTAMP-`visitors`.lastPolled), lastPolled=UTC_TIMESTAMP, status='$status' WHERE visitorId='$visitorId';";
  $retrieveSql = "SELECT * FROM `visitors` ORDER BY ind DESC;";

  $updateResult = mysqli_query($link,$updateSql);
  $retrieveResult = mysqli_query($link,$retrieveSql);

  if($updateResult && $retrieveResult){
    while($row=mysqli_fetch_assoc($retrieveResult)){
      $rows[] = $row;
    }  
    echo json_encode([$rows]);
  }else{
    if (!$updateResult) {
      echo "Could not update visitor. ";
    }   
    if (!$retrieveResult) {
      echo "Could not retrieve visitors. ";
    }   
  }
	mysqli_close($link);
?>