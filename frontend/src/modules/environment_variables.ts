const port = 8000;
const protocol = 'http';
const hostName = 'localhost';
const authenticationServerUrl = `${protocol}://${hostName}:${port}/authentication`;
const galleryServerUrl = `${protocol}://${hostName}:${port}/gallery`;
const signUpServerUrl = `${protocol}://${hostName}:${port}/signUp`;
const galleryUrl = `gallery.html`;
const loginUrl = `index.html`;
const currentUrl = new URL(window.location.href);

export {
  port,
  protocol,
  hostName,
  authenticationServerUrl,
  galleryServerUrl,
  signUpServerUrl,
  galleryUrl,
  loginUrl,
  currentUrl
}