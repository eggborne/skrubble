<?php include("config.php");
  $sql= "SELECT * FROM `word-rules` ORDER BY lastEdited DESC;";
  $result=mysqli_query($link, $sql);
  
  if($result){
    while($row=mysqli_fetch_assoc($result)){
      $rows[] = $row;
    }    
    echo json_encode([$rows]);
  }else{      
    echo 'GET ALL RULESETS FAILED';            
  }
  mysqli_close($link);
?>