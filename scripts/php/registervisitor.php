<?php
	include("config.php");

	$postData = json_decode(file_get_contents("php://input"), TRUE);
	$visitorId = $postData['visitorId'];
	$displayName = $postData['displayName'];

	$checkSql = "SELECT * FROM `visitors` WHERE visitorId='$visitorId';";
	$checkResult=mysqli_query($link, $checkSql);

	while($row=mysqli_fetch_assoc($checkResult)){
		$rows[] = $row;
	}    
	if ($rows[0]) {
		$updateSql = "UPDATE `visitors` SET joinedAt=UTC_TIMESTAMP, lastPolled=UTC_TIMESTAMP, displayName='$displayName' WHERE visitorId='$visitorId';";

		$sql = mysqli_query($link,$updateSql);
		if($sql){
			echo 'Updated existing visitor!';
		}else{     
			echo "Could not update new visitor.";
		}
	} else {
		$insertSql = "INSERT INTO `visitors` (`displayName`, `visitorId`, `status`, `joinedAt`, `lastPolled`) VALUES ('$displayName', '$visitorId', 'lobby', UTC_TIMESTAMP, UTC_TIMESTAMP);";
	
		$sql = mysqli_query($link,$insertSql);
		if($sql){
			echo $visitorId;
		}else{     
			echo "Could not register new visitor.";    
		}
	}

	mysqli_close($link);
?>