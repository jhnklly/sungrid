<?php

include '../ignr/dbconfig.php';

date_default_timezone_set('America/Los_Angeles');
$date = date('Y-m-d');
console_log($date);
print $date;

// Query the db to see if we already have data for today


try {
  $dbh = new PDO("pgsql:host=$host;dbname=$dbname", $dbuser, $dbpass, array(PDO::ATTR_PERSISTENT => true));
} catch (PDOException $e) {
  echo "Error : " . $e->getMessage() . "<br/>";
  die();
}

/*
alter table forecasts add column epochseconds integer;
alter table forecasts add column lat numeric(12,8);
alter table forecasts add column lon numeric(12,8);
*/
$sql = "SELECT forecast_date, forecast_json FROM forecasts WHERE forecast_date = $date";

if ($res = $conn->query($sql)) {

  if ($dbh->fetchColumn() > 0) {
    # code...
    foreach ($dbh->query($sql) as $row) {
      print $row['forecast_date'] . " ";
      print $row['forecast_json'] . "<br>";
    }
  }

}

// And write to db

$sql = $pdo->prepare("INSERT INTO forecasts(forecast_date, forecast_json) VALUES(?, ?)");
$sql->execute(array($forecast_date, $forecast_json));



// Use a geojson pt file to get coordinates to fetch

// If it's not yet in the db, get today's data and forecasts


$APIKEY = "86f515c3f0103714bc87cfc7910bcdc5";

$url = "proxy.php?url=" . encodeURIComponent( "https://api.forecast.io/forecast/" . $APIKEY . "/") ; //. latLonTime.join(",") );

console_log($url);
print $url;


/*
notes:
CREATE TABLE forecasts (
  id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  forecast_date TIMESTAMP,
  forecast_json TEXT
)

*/

function encodeURIComponent($str) {
    //$revert = array('%21'=>'!', '%2A'=>'*', '%27'=>"'", '%28'=>'(', '%29'=>')');
    return strtr(rawurlencode($str), $revert);
}

function console_log_json($data) {
  echo "<script>";
  echo 'console.log('. json_encode( $data ) .')';
  echo '</script>';
}

function console_log( $data ){
  echo '<script>';
  echo 'console.log("'. $data  .'")';
  echo '</script>';
}

?>