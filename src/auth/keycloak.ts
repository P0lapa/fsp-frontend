// import Keycloak from 'keycloak-js';

// const keycloak = new Keycloak({
//   url: 'http://localhost:8081',
//   realm: 'fsp-sevastopol',
//   clientId: 'fsp_react',
// });

// export default keycloak;


import Keycloak from 'keycloak-js'

const keycloak = new Keycloak({
  url: import.meta.env.VITE_KEYCLOAK_URL,
  realm: import.meta.env.VITE_KEYCLOAK_REALM,
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID,
})

export default keycloak