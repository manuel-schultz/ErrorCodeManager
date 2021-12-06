const fs     = require( 'fs' );
const path   = require( 'path' );
const remote = require( '@electron/remote' );

$( document ).ready( function() {
  display_error_code_types();
});

function display_error_code_types() {
  let datapath = dataPath();
  fs.readFile( path.join( datapath, 'errorcodetypes.json' ), function( err, data ) {
    if ( err ) {
      return console.error( err );
    }

    let errorcodetypes = JSON.parse( data );
    errorcodetypes = sortJson( errorcodetypes.errorcodetypes, 'number', true );

    $.each( errorcodetypes, function( index, errortype ) {
      let div = "<div class='bordered-box errortypecode-box'>" +
                "<div style='width: calc(50% - 12px); font-weight: bold;'>PreFix: " + errortype.prefix + "</div>" +
                "<div style='width: calc(50% - 12px); text-align: right;'>Länge: " + errortype.length + "</div>" +
                "<div style='width: 24px; text-align: right;'>" + "<button class='btn btn-default' style='height: 20px; width: 20px; padding: 2px;' onclick='delete_error_code( " + errortype.number + " )'>X</button>" + "</div>" +
                "<div style='width: calc(100% - 24px); text-align: center; font-weight: bold;'>" + errortype.number + "</div>" +
                "<div style='width: calc(100% - 24px); text-align: center;'>" + errortype.description + "</div>" +
                "</div>";

      $( 'div#error_code_types_display_space' ).append( div );
    });
  });
}

function delete_error_code( errortype_to_delete ) {
  let datapath = dataPath();
  fs.readFile( path.join( datapath, 'errorcodetypes.json' ), function( err, data ) {
    if ( err ) {
      return console.error( err );
    }
    let errortypes = JSON.parse( data );
    let errortype_index = searchInJsonForIndex( errortypes.errorcodetypes, 'number', parseInt( errortype_to_delete ) );
    errortypes.errorcodetypes.splice( errortype_index, 1 );

    fs.writeFile( path.join( datapath, 'errorcodetypes.json' ), JSON.stringify( errortypes, null, '\t' ), function( err, data ) {
      if ( err ) {
        return console.error( err );
      }
      $( 'div#error_code_types_display_space' ).html( '' );
      display_error_code_types();
    });

  });
}
