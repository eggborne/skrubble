<?php include("config.php");
  $sql= "SELECT * FROM `game-sessions` ORDER BY ind DESC;";
  $result=mysqli_query($link, $sql);
  
  if($result){
    while($row=mysqli_fetch_assoc($result)){
      $rows[] = $row;
    }  
    echo json_encode([$rows]);
  }else{
    echo 'GET ALL GAME SESSIONS FAILED';
  }
  mysqli_close($link);
?>