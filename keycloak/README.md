# Keycloak Theme Preview

## Run local Keycloak with the custom theme

```powershell
docker run --rm -p 8080:8080 `
  -e KEYCLOAK_ADMIN=admin `
  -e KEYCLOAK_ADMIN_PASSWORD=admin `
  -v "${PWD}/keycloak/themes:/opt/keycloak/themes" `
  quay.io/keycloak/keycloak:26.2 `
  start-dev
```

## Activate the theme

1. Open `http://localhost:8080`.
2. Sign in to the admin console.
3. Open the target realm.
4. Go to `Realm settings -> Themes`.
5. Set `Login theme` to `fsp-auth`.
6. Save and test the login and register flows.

## Stage 1 limitations

Stage 1 styles the standard Keycloak layout only. It does not include custom template overrides, custom field icons, or a full recreation of the Figma register composition.

## Review checklist

1. Verify dark mode matches the terminal mood.
2. Verify light mode still feels like the same product.
3. Verify login, register, forgot password, and error states are visually consistent.
4. Decide whether any remaining mismatch is caused by layout structure rather than styling.
