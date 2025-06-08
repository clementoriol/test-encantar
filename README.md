# Image Recognition PoC with Encantar

Quick Proof of Concept for recognizing and highlighting images from references using [encantar-js](https://github.com/alemart/encantar-js/tree/master).

Note:
The full encantar-js source code is included for now as a dirty workaround, because :

- the lib is not published on npm
- the lib lacks type definitions
- some of the lib settings are not customizable so I need to mess around settings

I'll need to get in touch with the library author about these

## Usage

- Open the app from a mobile device :

  ![QR Code to production url](./src/qrcode.jpg?raw=true "Title")

  https://test-encantar-production.up.railway.app/

- Allow the access to the camera (your browser should prompt you, if not check your browser settings)
- Open up one of the reference images on a desktop computer
  - [Cat ref](./src/references-source/cat.jpg)
  - [Dog ref](./src/references-source/dog.jpg)
- Point your mobile device camera at the reference image, you should see a success message and a dot if it's tracked successfully

## Local Dev Setup

### 1. Install Pnpm v8

⚠️ Make sure to install v8.x.x
See [https://pnpm.io/installation](https://pnpm.io/installation)

### 2. Install depedencies

```
pnpm install
```

### 3. Start the local server

```
pnpm dev
```

### 4. Open the local server from your mobile device

When starting, the local server should output the "Network" Url.

```
 VITE v6.3.5  ready in 108 ms

  ➜  Local:   https://localhost:3000/
  ➜  Local:   https://192.168.vite.*:3000/
  ➜  Network: https://192.168.x.x:3000/   <--------- Here
  ➜  press h + enter to show help
```

- Visit this address from your mobile device
- You'll see a message that the https cert is invalid. This is normal as we don't generate a cert in dev.
- Click on Advanced -> Proceeed to https://192.168.x.x (unsafe) to ignore the error and proceed to the local server

## Add new Images

- Add images to the `scripts/references-source` folder
- Run the `pnpm prepare-references` script. This will output them in ./public and prepare the references.json file
- Reload your page

## TODO

- [ ] Check how performant it is with ~200 images
- [ ] Check performance on a lower-end device
