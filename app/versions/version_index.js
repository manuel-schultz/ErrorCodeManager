const fs     = require( 'fs' );
const path   = require( 'path' );
const remote = require( '@electron/remote' );

$( document ).ready( function() {
  display_versions();
});

function display_versions() {
  let datapath = dataPath();
  fs.readFile( path.join( datapath, 'apiversions.json' ), function( err, data ) {
    if ( err ) {
      return console.error( err );
    }

    let versions = JSON.parse( data );

    $.each( sortSemanticVersions( versions.versions ), function( index, version ) {
      let div = "<div class='bordered-box version-box'>" +
                "<div style='width: 24px; text-align: right; order: 2;'>" + "<button class='btn btn-default' style='height: 20px; width: 20px; padding: 2px;' data-version='" + version.version + "' onclick='delete_version( this )'>X</button>" + "</div>" +
                "<div style='width: calc(100% - 24px); order: 1; text-align: center; font-weight: bold; font-size: 30px;'>" + version.version + "</div>" +
                "<div style='width: calc(100% - 24px); order: 3; text-align: center;'>" + version.release + "</div>" +
                "</div>";

      $( 'div#versions_display_space' ).append( div );
    });
  });
}

function delete_version( that ) {
  let version_to_delete = $( that ).data( 'version' );
  let datapath = dataPath();
  fs.readFile( path.join( datapath, 'apiversions.json' ), function( err, data ) {
    if ( err ) {
      return console.error( err );
    }
    let versions = JSON.parse( data );
    let version_index = searchInJsonForIndex( versions.versions, 'version', version_to_delete.toString() );
    versions.versions.splice( version_index, 1 );

    fs.writeFile( path.join( datapath, 'apiversions.json' ), JSON.stringify( versions, null, '\t' ), function( err, data ) {
      if ( err ) {
        return console.error( err );
      }
      $( 'div#versions_display_space' ).html( '' );
      display_versions();
    });
  });
}
