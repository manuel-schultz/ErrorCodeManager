const remote = require( '@electron/remote' );

$( document ).ready( function() {
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
