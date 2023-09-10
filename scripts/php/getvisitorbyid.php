<?php include("config.php");

  $postData = json_decode(file_get_contents("php://input"), TRUE);
  $visitorId = $postData['visitorId'];

  $sql= "SELECT * FROM `visitors` WHERE visitorId='$visitorId' ORDER BY ind DESC;";
  $result=mysqli_query($link, $sql);
  
  if($result){
    while($row=mysqli_fetch_assoc($result)){
      $rows[] = $row;
    }  
    echo json_encode([$rows]);
  }else{
    echo 'GET VISITOR BY ID FAILED';
  }
  mysqli_close($link);
?>