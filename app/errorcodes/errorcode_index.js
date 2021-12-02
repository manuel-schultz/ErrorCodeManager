const fs   = require( 'fs' );
const path = require( 'path' );

$( document ).ready( function() {
  display_error_codes();
  fill_filter_options();
  $( 'div#filter_wraper' ).css( 'display', 'none' );
});

function display_error_codes() {
  $( 'div#error_codes_display_space' ).html( '' );
  let datapath = dataPath();
  fs.readFile( path.join( datapath, 'errors.json' ), function( err, data ) {
    if ( err ) {
      console.error( err );
      return;
    }

    let errors = JSON.parse( data );

    errors.errors = errors_filtering( errors.errors );

    errors = sortJson( errors.errors, 'error_code', $( 'button#sort_button' ).data( 'direction' ) === 'asc' );

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
      display_error_codes();
    });

  });
}

function fill_filter_options() {
  let datapath       = dataPath();
  let apiversions    = JSON.parse( fs.readFileSync( path.join( datapath, 'apiversions.json' ), { encoding:'utf8' } ) ).versions;
  let errorcodetypes = JSON.parse( fs.readFileSync( path.join( datapath, 'errorcodetypes.json' ), { encoding:'utf8' } ) ).errorcodetypes;

  $.each( apiversions, function( index, version ) {
    $( 'select#filter_api_versions' ).append( new Option( version.version, version.version ) );
  });
  $.each( errorcodetypes, function( index, type ) {
    $( 'select#filter_errorcode_types' ).append( new Option( type.number, type.prefix ) );
  });
}

function toggle_filter_wraper_display_status() {
  $( 'div#filter_wraper' ).slideToggle( 'medium', function() {
    if ( $( this ).is( ':visible' ) ) {
      $( this ).css( 'display', 'flex' );
    }
  });
}

function errors_filtering( errors ) {
  if ( $( 'select#filter_api_versions' ).val() === '' && $( 'select#filter_errorcode_types' ).val() === '' && $( 'input#filter_searchquery' ).val() === '' ) {
    console.log( 'No Filters enabled' );
    return errors;
  }

  if ( $( 'select#filter_api_versions' ).val() !== '' ) {
    errors = errors.filter( error => error.implemented === $( 'select#filter_api_versions' ).val().toString() )
  }

  if ( $( 'select#filter_errorcode_types' ).val() !== '' ) {
    errors = errors.filter( error => error.prefix === parseInt( $( 'select#filter_errorcode_types' ).val() ) )
  }

  if ( $( 'input#filter_searchquery' ).val() !== '' ) {
    errors = errors.filter( function ( error, index ) {
      if ( error.error_code_str.toLowerCase().match( $( 'input#filter_searchquery' ).val().toLowerCase() ) ) {
        return true;
      }
      if ( error.title.toLowerCase().match( $( 'input#filter_searchquery' ).val().toLowerCase() ) ) {
        return true;
      }
      if ( error.description.toLowerCase().match( $( 'input#filter_searchquery' ).val().toLowerCase() ) ) {
        return true;
      }
    });
  }

  return errors;
}

function change_sorting( btn ) {
  let button = $( btn );
  if ( button.data( 'direction' ) === 'asc' ) {
    button.data( 'direction', 'desc' );
  } else {
    button.data( 'direction', 'asc' );
  }
  display_error_codes();
}
