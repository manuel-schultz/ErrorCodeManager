String.prototype.capitalizeEveryWord = function () {
  return this.replace( /(^\w|\s\w)/g, m => m.toUpperCase() )
}

Array.prototype.unique = function() {
  return this.filter( function ( value, index, self ) {
    return self.indexOf( value ) === index;
  });
}

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
  for ( let i = 0; i <= json.length; i++ ) {
    if ( json.length === i ) {
      // if not existent in the json, return false
      return false;
    }
    if ( json[i][property] === value ) {
      return i;
    }
  }
}

function dataPath() {
  return fs.readFileSync( path.join( path.resolve( 'config' ), 'datapath.txt' ), { encoding:'utf8' } );
}
