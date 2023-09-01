<?php
	include("config.php");

	$postData = json_decode(file_get_contents("php://input"), TRUE);
	$rulesetID = $postData['rulesetID'];
	$ruleType = $postData['ruleType'];
	$newList = json_encode($postData['newList']);
	
	$sql = mysqli_query(
		$link, 
		"UPDATE `invalid-strings` SET $ruleType='$newList' WHERE id='$rulesetID';"
	);

	if($sql){
		echo $rulesetID;
  }else{     
    echo "Could not save.";    
	}
	mysqli_close($link);
?>