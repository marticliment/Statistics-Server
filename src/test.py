import requests
from subprocess import Popen
import os


if(os.path.isdir("./tests-data")):
    for root, dirs, files in os.walk("./tests-data", topdown=False):
        for name in files:
            os.remove(os.path.join(root, name))
        for name in dirs:
            os.rmdir(os.path.join(root, name))
    os.removedirs("./tests-data")


users = ["user1", "user2", "user3", "user4", "user5", "user3", "user6"]
versions = ["ver1", "ver1", "ver2", "ver1", "ver1", "ver2", "ver1"]
activeManagers = [0x0001, 0x0002, 0x0003, 0x0001, 0x0003, 0x0003, 0x0004]
activeVersions = [0x0001, 0x0002, 0x0001, 0x0803, 0x0804, 0x0001, 0x0003]

progrs = ["prog1", "prog2", "prog3", "prog2", "prog1", "prog1", "prog1"]
manags = ["M1", "M1", "M1", "M1", "M1", "M1", "M2"]
sourcs = ["source1", "source2", "source1", "source1", "source1", "source1", "source1"]



process = Popen(f"bun {os.getcwd()}\\server.ts --data-folder ./tests-data".split(" "), shell=False, cwd=os.getcwd())

errors = 0

try:
    for i in range(7):
        print(f"Registering user {i+1}...")
        url = "http://localhost:3000/activity"
        headers = {
            "clientId": users[i],
            "clientVersion": versions[i],
            "activeManagers": str(int(activeManagers[i])),
            "activeSettings": str(int(activeVersions[i])),
        }

        response = requests.post(url, headers=headers, json={})
        print("Result:", response.status_code)
        
    print("Users registered")


    for i in range(7):
        print(f"Installing program for user  user {i+1}...")
        url = "http://localhost:3000/install"
        headers = {
            "clientId": users[i],
            "packageId": progrs[i],
            "managerName": manags[i],
            "sourceName": sourcs[i],
        }

        response = requests.post(url, headers=headers, json={})
        print("Result:", response.status_code)



    print("Fetching report...")
    report_url = "http://localhost:3000/report"
    report_headers = {
        "apiKey": "HelloWorld"
    }

    report_response = requests.get(report_url, headers=report_headers)
    report_data = report_response.json()
    


    if(report_data["active_users"] != 6):
        print("❌ active_users had an unexpected value")
        errors += 1
    
    if(int(report_data["active_versions"]["ver1"]) != 83):
        print(f"❌ active_versions.ver1 had an unexpected value {int(report_data["active_versions"]["ver1"])}")
        errors += 1
        
    if(int(report_data["active_versions"]["ver2"]) != 16):
        print(f"❌ active_versions.ver2 had an unexpected value {int(report_data["active_versions"]["ver2"])}")
        errors += 1
    
    managerVal = [66.66666666666667, 50, 16.666666666666668, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    for i in range(len(managerVal)):
        if(report_data["active_managers"][i] != managerVal[i]):
            print(f"❌ active_managers[{i}] had an unexpected value {report_data["active_managers"][i]} (expected was {managerVal[i]})")
            errors += 1
    
   
    settingsVal = [66.66666666666667, 50, 16.666666666666668, 0, 0, 0, 0, 0, 0, 0, 0, 33.333333333333336, 0, 0, 0, 0]
    for i in range(len(settingsVal)):
        if(report_data["active_settings"][i] != settingsVal[i]):
            print(f"❌ active_settings[{i}] had an unexpected value {report_data["active_settings"][i]} (expected was {settingsVal[i]})")
            errors += 1
    
    expectedRanking = [['prog1', 'M1', 'source1', 3], ['prog2', 'M1', 'source2', 1], ['prog3', 'M1', 'source1', 1], ['prog2', 'M1', 'source1', 1], ['prog1', 'M2', 'source1', 1]]
    
    for i in range(len(expectedRanking)):
        element = report_data["program_ranking"][i]
        for j in range(len(element)):
            if element[j] != expectedRanking[i][j]:
                print(f"❌ program_ranking[{i}] with value {element[j]} does not equal expected value {expectedRanking[i][j]}")        
                errors += 1
        
    print("---------------------------------")
    if errors == 0: 
        print("✅ Tests passed")
    else: 
        print(f"❌ Tests failed with {errors} failures")
    

    print("Report data:", report_data)

except Exception as e:
    print("TEST ERROR!")
    print(e)
    print(e.__traceback__)
    process.kill()
    
finally:
    process.kill()
    
exit(errors)