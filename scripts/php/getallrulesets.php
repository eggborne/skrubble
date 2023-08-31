<?php include("config.php");
  $sql= "SELECT * FROM `invalid-strings` ORDER BY lastEdited DESC;";
  $result=mysqli_query($link, $sql);
  $patternSql = "SELECT * FROM `patterns`;";
  $patternResult=mysqli_query($link,$patternSql);
  
  if($result && $patternResult){
    while($row=mysqli_fetch_assoc($result)){
      $rows[] = $row;
    }
    while($row=mysqli_fetch_assoc($patternResult)){
      $patternRows[] = $row;
    }
    // echo $patternResult;
    echo json_encode([$rows, $patternRows]);
  }else{      
    echo 'GET ALL RULESETS FAILED';            
  }
  mysqli_close($link);
?>