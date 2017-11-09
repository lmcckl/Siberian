/**
 * SiberianCMS
 *
 * @version 4.1.0
 * @author Xtraball SAS <dev@xtraball.com>
 *
 */
var path = require('path'),
    fs = require('fs'),
    sh = require('shelljs'),
    nopt = require('nopt'),
    clc = require('cli-color');

function init() {
    var bin = sh.exec("echo $PWD", {silent: true}).output.trim()+"/bin/siberian";

    /** Copy Siberian CLI custom modification */
    sh.exec("cp -rp ./bin/config/platforms.js ./node_modules/cordova-lib/src/cordova/platform.js");
    sh.exec("cp -rp ./bin/config/platformsConfig.json ./node_modules/cordova-lib/src/platforms/platformsConfig.json");
    sh.exec("cp -rp ./bin/config/plugman.js ./node_modules/cordova-lib/src/plugman/plugman.js");

    /** Configuring environment */
    sh.exec("git config core.fileMode false");
    sh.exec("git submodule foreach git config core.fileMode false");

    console.log(clc.blue("When installing be sure to execute these commands from the project directory:\n"));
    console.log(clc.blue("echo \"alias siberian='"+bin+"'\" >> ~/.bash_profile && source ~/.bash_profile"));

    console.log("\nDone.");
}

module.exports = install;

function install(inputArgs) {

    init();

    var args = nopt(inputArgs);

    // For CordovaError print only the message without stack trace unless we
    // are in a verbose mode.
    process.on('uncaughtException', function (err) {
        process.exit(1);
    });

}