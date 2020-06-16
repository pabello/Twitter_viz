# Twitter_viz

## Table of contents
- [General info](#general-info)
- [Technologies](#technologies)
- [Setup](#setup)

## General info
This is a project that aims to visualize in a neat and efficient way the contents grabbed from Twitter API.

It was built and tested on linux and this is recommended environment to run the project.

## Technologies
- Python v3.7.7
- Tweepy - python library wrapping Twitter API
- Flask 1.1.2
- Node.js v12.18.0
- npm v6.14.4
- Node packages:
    - Supervisor v0.12.0
    - Request v2.88.2
    - D3JS v5.16.0

## Setup:

Frist you need to get `Python3` and `Node.js`, which comes with `npm`.

Install required libraries:
```
pip3 install Tweepy Flask
npm install Supervisor Request d3
```

Open console in main project directory
1. `supervisor app.js`
2. `cd backend/`
3. `flask app.py`
Now it's up and running and you can connect on your localhost:8080
