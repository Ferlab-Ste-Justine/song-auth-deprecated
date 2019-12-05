import os
import keycloak_client

if __name__ == '__main__':
    token = keycloak_client.KeyCloakAuthClient(
        os.environ['KEYCLOAK_AUTH_URL'],
        os.environ['KEYCLOAK_CLIENT_ID'],
        os.environ['KEYCLOAK_CLIENT_SECRET']
    ).login(
        os.environ['KEYCLOAK_USERNAME'], 
        os.environ['KEYCLOAK_PASSWORD']
    )
    print(token)