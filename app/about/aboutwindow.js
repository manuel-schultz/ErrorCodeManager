const remote = require( '@electron/remote' );
const fs     = require( 'fs' );
const path   = require( 'path' );

$( document ).ready( function() {
  if ( JSON.parse( fs.readFileSync( path.join( dataPath(), 'settings.json' ), { encoding:'utf8' } ) ).settings.darkmode ) {
    $( 'body' ).addClass( 'darktheme' );
  } else {
    $( 'body' ).addClass( 'lighttheme' );
  }

  $( 'h1#app-name' ).text( remote.app.getName() );
  $( 'span#app-version' ).text( remote.app.getVersion() );
  $( 'span#electron-version' ).text( process.versions.electron );
  $( 'span#app-authors' ).html( '<a href="#" onclick="open_github_connection(event)">Manuel Schultz</a>' );
});

function open_github_connection( e ) {
  e.preventDefault();
  remote.shell.openExternal( 'https://github.com/mansc-faxonline' );
}

function close_about_window() {
  remote.getCurrentWindow().close();
}
