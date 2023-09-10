<?php
	include("config.php");

	$postData = json_decode(file_get_contents("php://input"), TRUE);
	$currentLocation = $postData['currentLocation'];
	$phase = $postData['phase'];
	$visitorId = $postData['visitorId'];
	$latency = $postData['latency'];
	$currentOpponentId = $postData['currentOpponentId'];

  $updateSql = "UPDATE `visitors` SET lastPolled=UTC_TIMESTAMP, currentLocation='$currentLocation', phase='$phase', latency='$latency', currentOpponentId='$currentOpponentId' WHERE visitorId='$visitorId';";
  $retrieveSql = "SELECT * FROM `visitors` WHERE currentLocation='lobby' AND UTC_TIMESTAMP-lastPolled<5 ORDER BY ind DESC;";

  $updateResult = mysqli_query($link,$updateSql);
  $retrieveResult = mysqli_query($link,$retrieveSql);

  if($updateResult && $retrieveResult){
    while($row=mysqli_fetch_assoc($retrieveResult)){
      $rows[] = $row;
    }
    // mysqli_free_result($retrieveResult);
    echo json_encode([$rows]);
  } else {
    if (!$updateResult) {
      echo 'Handshake could not update.';
    }
    if (!$retrieveResult) {
      echo 'Handshake could not retrieve.';
    }
  }
  

	mysqli_close($link);
