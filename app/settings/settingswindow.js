const electron = require( 'electron' );
const remote   = require( '@electron/remote' );
const {app}    = require( 'electron' );
const url      = require( 'url' );
const fs       = require( 'fs' );
const path     = require( 'path' );

$( document ).ready( function() {
  let datapath = dataPath();
  var settings = JSON.parse( fs.readFileSync( path.join( datapath, 'settings.json' ), { encoding:'utf8' } ) ).settings

  if ( settings.semantic ) {
    $( 'input#semanticversioning' ).attr( 'checked', 'checked' );
  }
});

function save_settings() {
  let datapath = dataPath();
  let settings = JSON.parse( fs.readFileSync( path.join( datapath, 'settings.json' ), { encoding:'utf8' } ) ).settings;

  let filejson = { settings: settings };
  filejson.settings.semantic = $( 'input#semanticversioning' )[0].checked;

  fs.writeFileSync( path.join( datapath, 'settings.json' ), JSON.stringify( filejson, null, '\t' ), function( err, data ) { } );
  remote.dialog.showMessageBox({
    title: 'Success',
    message: 'Settings saved successfully!',
    type: 'info'
  });
}
