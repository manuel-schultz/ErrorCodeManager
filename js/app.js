$( 'document' ).ready( function() {
  $( 'div.form-space input, div.form-space select' ).keypress( function( e ) {
    if ( e.keyCode === 13 && e.key === 'Enter' ) {
      if ( $( 'button.submit' ).length > 0 ) {
        $( 'button.submit' ).click();
      }
    }
  });
});

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

function sortSemanticVersions(fileVersions, orderRequest = 'DESC') {
  const order = orderRequest;

  function compareSemanticVersions(a, b) {
    let versionA  = a.semantic.map(semanticPart => convertSemanticPartToValue(semanticPart));
    let versionB  = b.semantic.map(semanticPart => convertSemanticPartToValue(semanticPart));
    let maxLength = Math.max(versionA.length, versionB.length);

    for (let i = 0; i < maxLength; i++) {
      let partA = i < versionA.length ? versionA[i] : 0;
      let partB = i < versionB.length ? versionB[i] : 0;

      if (partA !== partB) {
        if (order.toUpperCase() === 'ASC') {
          return partA - partB;
        } else {
          return partB - partA;
        }
      }
    }

    return 0;
  }

  function convertSemanticPartToValue(semanticPart) {
    if (!isNaN(semanticPart)) {
      return parseInt(semanticPart) * 100; 
    } else {
      const numericPart = parseInt(semanticPart);
      const alphaPart = semanticPart.replace(/\d+/g, '');
      return numericPart * 100 + (alphaPart.charCodeAt(0) - 50);
    }
  }

  return fileVersions.sort(compareSemanticVersions);
}

function dataPath() {
  return fs.readFileSync( path.join( remote.app.getAppPath(), 'config', 'datapath.txt' ), { encoding: 'utf8' } );
}
