function go_to( path ) {
  window.location = path;
}

function sortJson( json, property, asc ) {
  json.sort( function( a, b ) {
      if ( asc ) {
          return ( a[property] > b[property] ) ? 1 : ( ( a[property] < b[property] ) ? -1 : 0 );
      } else {
          return ( b[property] > a[property] ) ? 1 : ( ( b[property] < a[property] ) ? -1 : 0 );
      }
  });
  return json;
}

function searchInJsonForIndex( json, property, value ) {
  for ( let i = 0; i < json.length; i++ ) {
    if ( json[i][property] === value ) {
      return i;
    }
  }
}

function dataPath() {
  return fs.readFileSync( path.join( path.resolve( 'config' ), 'datapath.txt' ), { encoding:'utf8' } );
}
