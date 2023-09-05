<?php
	include("config.php");

	$postData = json_decode(file_get_contents("php://input"), TRUE);
	$location = $postData['location'];
	$phase = $postData['phase'];
	$visitorId = $postData['visitorId'];

  $updateSql = "UPDATE `visitors` SET lastPolled=UTC_TIMESTAMP, location='$location', phase='$phase' WHERE visitorId='$visitorId';";
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