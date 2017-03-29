'use strict';
require('colors');

class Utility {
    static printError(text) {
        console.error(text.red);
        process.exit(1);
    }
}

module.exports = Utility;