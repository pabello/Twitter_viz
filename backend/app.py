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
    print('Received a request')
    if request.method == 'GET':
        fetcher.get_tweets('visualization')
        Extractor.analyze('visualization')
        return make_response("Successfully resolved request", 200)
    elif request.method == 'POST':
        print('It\'s a POST request')
        # requested_topic = request.form['topic']
        # return make_response("Successfully resolved request", 200)
        return make_response("Bang!", 200)
        pass
    else:
        return make_response("Not supported request type.", 400)


if __name__ == '__main__':
    app.run(port=5000)
