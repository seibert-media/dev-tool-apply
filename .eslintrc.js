module.exports = {
    "env": {
        "node": true,
        "es6": true
    },
    "extends": "eslint-config-linchpin",
    "globals": {
        "SeibertMedia": false // TODO: check globals
    },
    "rules": {
        "id-blacklist": ["off"], // TODO: custom blacklist,
        "id-length": ["warn", { "min": 2, "max": 45,  "exceptions": ["$", "_"]} ],
        "max-params": ["warn", 5], // TODO: check max-params
        "complexity": ["warn", 7] // TODO: check complexity
    }
};
