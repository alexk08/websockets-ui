# RSSchool NodeJS websocket

## Installation
1. Clone/download repo
2. `npm install`

## Usage
**Development**

`npm run start:dev`

* The app is served at http://localhost:8181 using nodemon.
* The WebSocket server is accessible at ws://localhost:8181 using nodemon.

**Production**

`npm run start`

* The app is served at http://localhost:8181 without nodemon.
* The WebSocket server is accessible at ws://localhost:8181 without nodemon.

---

**All commands**

Command | Description
--- | ---
`npm run build` | Creates a production build in the `./build` forlder
`npm run start` | Runs the app @ `http://localhost:8181` and WebSocket server @ `ws://localhost:8181` without nodemon
`npm run start:dev` | Runs the app @ `http://localhost:8181` and WebSocket server @ `ws://localhost:8181` using nodemon

**Note**: replace `npm` with `yarn` in `package.json` if you use yarn.
