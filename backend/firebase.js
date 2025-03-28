const admin = require("firebase-admin");

// Load your service account key
// const serviceAccount = require("./firebase-adminsdk.json");

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
// });
const dotenv = require("dotenv");

dotenv.config();

admin.initializeApp({
  credential: admin.credential.cert({
    type: process.env.TYPE,
    project_id: process.env.PROJECT_ID,
    private_key: process.env.PRIVATE_KEY,
    private_key_id:process.env.PRIVATE_KEY_ID,
    client_email: process.env.CLIENT_EMAIL,
    client_id:process.env.CLIENT_ID,
    auth_uri:process.env.AUTH_URI,
    token_uri: process.env.TOKEN_URI,
    auth_provider_x509_cert_url:process.env.AUTH_PROVIDER_CERT_URL,
    client_x509_cert_url:process.env.CLIENT_CERT_URL,
    universe_domain:process.env.UNIVERSE_DOMAIN
  }),
});

module.exports = admin;
