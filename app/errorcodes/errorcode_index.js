const fs   = require( 'fs' );
const path = require( 'path' );

$( document ).ready( function() {
  display_error_codes();
});

function display_error_codes() {
  let datapath = dataPath();
  fs.readFile( path.join( datapath, 'errors.json' ), function( err, data ) {
    if ( err ) {
      console.error( err );
      return;
    }

    let errors = JSON.parse( data );
    errors = sortJson( errors.errors, 'error_code', true );
    let table = document.createElement( 'table' );

    $.each( errors, function( index, error ) {
      let div = "<div class='bordered-box errorcode-box'>" +
                "<div style='width: calc(50% - 12px); font-weight: bold;'>" + error.error_code_str + "</div>" +
                "<div style='width: calc(50% - 12px); text-align: right;'>" + error.implemented + "</div>" +
                "<div style='width: 24px; text-align: right;'>" + "<button class='btn btn-default' style='height: 20px; width: 20px; padding: 2px;' onclick='delete_error_code( " + error.error_code_str + " )'>X</button>" + "</div>" +
                "<div style='width: calc(100% - 24px); text-align: center; font-weight: bold;'>" + error.title + "</div>" +
                "<div style='width: calc(100% - 24px); text-align: center;'>" + error.description + "</div>" +
                "</div>";

      $( 'div#error_codes_display_space' ).append( div );
    });
  });
}

function delete_error_code( error_to_delete ) {
  let datapath = dataPath();
  fs.readFile( path.join( datapath, 'errors.json' ), function( err, data ) {
    if ( err ) {
      return console.error( err );
    }
    let errors = JSON.parse( data );
    let error_index = searchInJsonForIndex( errors.errors, 'error_code_str', error_to_delete.toString() );
    errors.errors.splice(error_index, 1);

    fs.writeFile( path.join( datapath, 'errors.json' ), JSON.stringify( errors, null, '\t' ), function( err, data ) {
      if ( err ) {
        return console.error( err );
      }
      $( 'div#error_codes_display_space' ).html( '' );
      display_error_codes();
    });

  });
}
