#!/usr/bin/env python3
import requests
import json

# Define repository information
owner = 'asabaal'
repo = 'midi_song_creation_tool'

# GitHub API URL for listing branches
url = f"https://api.github.com/repos/{owner}/{repo}/branches"

# Make the API request
response = requests.get(url)

# Check if the request was successful
if response.status_code == 200:
    branches = response.json()
    print(f"Branches in {owner}/{repo}:")
    for branch in branches:
        print(f"- {branch['name']}")
    
    # Save to a JSON file for reference
    with open('branches.json', 'w') as f:
        json.dump(branches, f, indent=2)
    print(f"Saved branch information to branches.json")
else:
    print(f"Error: {response.status_code}")
    print(response.text)
