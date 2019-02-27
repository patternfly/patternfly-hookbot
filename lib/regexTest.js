const exampleJson = `
{
    "name": "@redallen-patternfly/react-icons",
    "version": "7.0.0",
    "description": "PatternFly 4 Icons as React Components",
    "main": "dist/js/index.js",
    "module": "dist/esm/index.js",
    "types": "dist/js/index.d.ts",
    "sideEffects": false,
    "publishConfig": {
      "access": "public"
    },
    "repository": {
      "type": "git",
      "url": "https://github.com/redallen/patternfly-react.git"
    },
    "keywords": [
      "react",
      "patternfly"
    ],
    "author": "Red Hat",
    "license": "Apache-2.0",
    "bugs": {
      "url": "https://github.com/redallen/patternfly-react/issues"
    },
    "homepage": "https://github.com/redallen/patternfly-react#readme",
    "scripts": {
      "prebuild": "node ./build/generateIcons.js",
      "build": "yarn build:ts && yarn build:babel",
      "build:babel": "concurrently \"yarn build:babel:cjs\" \"yarn build:babel:esm\"",
      "build:babel:cjs": "cross-env BABEL_ENV=production:cjs babel src --out-dir dist/js",
      "build:babel:esm": "cross-env BABEL_ENV=production:esm babel src --out-dir dist/esm",
      "build:ts": "node ./scripts/copyTS.js"
    },
    "devDependencies": {
      "@fortawesome/free-solid-svg-icons": "^5.3.1",
      "@patternfly/patternfly": "1.0.178",
      "fs-extra": "^6.0.1",
      "glob": "^7.1.2",
      "node-plop": "^0.15.0",
      "npmlog": "^4.1.2"
    },
    "peerDependencies": {
      "prop-types": "^15.6.1",
      "react": "^16.4.0",
      "react-dom": "^15.6.2 || ^16.4.0"
    }
  }
`;

const packageName = '@patternfly/patternfly';
const newVersion = '1.0.200';
const regex = new RegExp(`("${packageName.replace('/', '\\/')}"\\s*:\\s*)".*"`);
console.log('regex', regex);
const updated = exampleJson.replace(regex, `$1"${newVersion}"`);
console.log('updated', updated);
