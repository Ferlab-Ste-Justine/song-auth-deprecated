import requests

#curl -v -k -X POST --data 'username=test' --data 'password=testtest' --data 'grant_type=password' --data 'scope=profile' --data 'client_id=clin-proxy-api' --data 'client_secret=01b99f28-1331-4fec-903b-c2e8043cec77' "https://localhost:8443/auth/realms/clin/protocol/openid-connect/token"
class KeyCloakAuthClient(object):
    login_url = '{base_url}/protocol/openid-connect/token'

    def __init__(self, base_url, client_id, client_secret):
        self.base_url = base_url
        self.client_id = client_id
        self.client_secret = client_secret
    
    def login(self, username, password):
        res = requests.post(
            self.login_url.format(base_url=self.base_url), 
            data={
                'username': username,
                'password': password,
                'grant_type': 'password',
                'scope': 'profile',
                'client_id': self.client_id,
                'client_secret': self.client_secret
            },
            verify=False
        )
        assert res.status_code == 200
        return res.json()['access_token']
