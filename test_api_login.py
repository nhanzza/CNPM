import json
import urllib.request
import urllib.error

url = "http://127.0.0.1:8000/api/v2/auth/login"
payload = {
    "email": "admin@bizflow.com",
    "password": "Admin@123"
}

headers = {
    "Content-Type": "application/json"
}

print(f"Testing login endpoint: {url}")
print(f"Payload: {json.dumps(payload)}")

try:
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode(),
        headers=headers,
        method="POST"
    )
    
    print("Sending request...")
    with urllib.request.urlopen(req) as response:
        result = json.loads(response.read().decode())
        print("Success!")
        print(json.dumps(result, indent=2))
except urllib.error.HTTPError as e:
    print(f"HTTP Error {e.code}")
    body = e.read().decode()
    print(f"Response: {body}")
    try:
        error_json = json.loads(body)
        print(json.dumps(error_json, indent=2))
    except:
        print(body)
except ConnectionRefusedError:
    print("Error: Connection refused - is the server running on port 8000?")
except Exception as e:
    print(f"Error: {type(e).__name__}: {e}")
    import traceback
    traceback.print_exc()
