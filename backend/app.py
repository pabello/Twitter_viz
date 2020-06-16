import Extractor
import asyncio

from time import sleep
from Peeker import TweetFetcher
from flask import Flask, request, make_response


app = Flask(__name__)
fetcher = TweetFetcher()
fetcher.authenticate()

@app.route('/', methods=['POST', 'GET'])
def get_resource():
    if request.method == 'GET':
        try:
            fetcher.get_tweets('visualization')
            Extractor.analyze('visualization')
            return make_response("Successfully resolved request", 200)
        except:
            return make_response("Could not load tweets :(")
    elif request.method == 'POST':
        print('Received a POST request')
        try:
            topic = request.json['topic']
            fetcher.get_tweets(topic)
            Extractor.analyze(topic)
            return make_response("Successfully resolved request", 200)
        except:
            return make_response("Could not load tweets :(")
    else:
        return make_response("Not supported request type.", 400)


if __name__ == '__main__':
    app.run(port=5000)
