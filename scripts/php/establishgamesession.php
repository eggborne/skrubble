<?php
	include("config.php");

	$postData = json_decode(file_get_contents("php://input"), TRUE);
	$userId = $postData['userId'];
	$opponentId = $postData['opponentId'];

	$checkSql = "SELECT * FROM `game-sessions` WHERE (player1Id='$userId' AND player2Id='$opponentId') OR (player1Id='$opponentId' AND player2Id='$userId');";
	$checkResult=mysqli_query($link, $checkSql);

	while($row=mysqli_fetch_assoc($checkResult)){
		$rows[] = $row;
	}    
	if ($rows[0]) {
		echo json_encode([$rows]);
	} else {
		$insertSql = "INSERT INTO `game-sessions` (`player1Id`, `player2Id`, `gameStartedAt`) VALUES ('$userId', '$opponentId', UTC_TIMESTAMP);";
	
		$insertResult = mysqli_query($link,$insertSql);
		if($insertResult){
      $getNewSql = "SELECT * FROM `game-sessions` WHERE ind=LAST_INSERT_ID();";
      $getNewResult = mysqli_query($link, $getNewSql);
      if ($getNewResult) {
        while ($row = mysqli_fetch_assoc($getNewResult)) {
          $rows[] = $row;
        }
        echo json_encode([$rows]);
      } else {
        echo 'Could not get newly-inserted row.';
      }
		}else{     
			echo "Could not establish new game session.";    
		}
	}

	mysqli_close($link);
?>