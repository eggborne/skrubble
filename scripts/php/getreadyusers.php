<?php
	include("config.php");
	// $currentPing = mysqli_fetch_array(mysqli_query($link, "SELECT UNIX_TIMESTAMP(NOW())"))[0];
	$usersSql = "SELECT * FROM `users` WHERE (UTC_TIMESTAMP - lastPing < 5 AND status = 'ready') ORDER BY joinTime ASC";
	$usersResult = mysqli_query($link, $usersSql);
	if ($usersResult) {
		$usersArray = array();
		while($rows=mysqli_fetch_assoc($usersResult)){
			$usersArray[] = json_encode($rows, TRUE);
		}
		echo json_encode($usersArray);
	} else {
		echo `no ready users`;
	}
	mysqli_close($link);
?>
