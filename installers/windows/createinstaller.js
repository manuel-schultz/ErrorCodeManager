const createWindowsInstaller = require( 'electron-winstaller' ).createWindowsInstaller;
const path                   = require( 'path' );

getInstallerConfig()
  .then( createWindowsInstaller )
  .catch( ( error ) => {
    console.error( error.message || error );
    process.exit( 1 );
  })

function getInstallerConfig () {
  console.log( 'creating windows installer' );
  const outPath = path.join( './', 'release-builds' );

  return Promise.resolve({
    appDirectory: path.join( outPath, 'ErrorCodeManager-win32-ia32/' ),
    authors: 'Manuel Schultz',
    noMsi: true,
    outputDirectory: path.join( outPath, 'windows-installer' ),
    exe: 'ErrorCodeManager.exe',
    setupExe: 'ErrorCodeManager-Installer.exe',
    setupIcon: path.join( './', 'img', 'icon.ico' )
  });
}
