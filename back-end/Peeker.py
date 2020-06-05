import sys
import tweepy

from pandas import DataFrame
from numpy import array
from json import JSONDecodeError
from os import path, mkdir, rename, remove
from subprocess import check_output
from time import time, sleep
from subprocess import CalledProcessError
from Functions import unwrap_line_to_dictionary


"""
This script queries Twitter API for tweets (used API is free but it only allows to access last 7 days).
It supports storing a topic list, re-fetching topics (meaning it wont fetch the same posts twice even if interrupted or crashed),
It saves the output in json-like format which was suitable for this purpose.
There is also an option to execute it along with Extractor.py script to concuct analysis on gathered posts.
Full list of options is available with --help variable.
"""

class TweetFetcher:

    def __init__(self):
        """
        Initializes the fetcher object.
        """
        self.api = None  # api connection to twitter
        self.auth = None  # user authentication object
        self.filters = ' -filter:retweets -filter:replies lang:en'  # twitter API filters for eliminating certain tweets

        self.retry_counter = 3  # initializing counter for retries on request failure


    def authenticate(self, customer_token_path='tokens/ConsumerToken', customer_secret_path='tokens/ConsumerSecret'):
        """
        Authenticates twitter developer user. Needs access tokens.\n
        :param customer_token_path: relative path to customer token\n
        :param customer_secret_path: relative path to customer secret token\n
        :raise Exception: if either of the paths is incorrect.
        """
        try:
            with open(customer_token_path, 'r') as file:
                customer_token = file.readline().strip()
            with open(customer_secret_path, 'r') as file:
                customer_secret = file.readline().strip()
            self.auth = tweepy.AppAuthHandler(customer_token, customer_secret)
            self.api = tweepy.API(self.auth, wait_on_rate_limit=True)
        except FileNotFoundError:
            raise Exception('Could not find customer token/secret file.')


    def get_tweets(self, keyword, last_fetched_id=None):
        """
        This method handles a single request for tweets, retries on exceptions
        filters the fetched data, fomats it and stores to a file.
        """

        last_fetched_id = self.get_last_fetched_id(keyword)
        tries = self.retry_counter

        while tries > 0:
            tweets = self.request_tweets(keyword, last_fetched_id)
            if len(tweets):
                tries = 0
            else:
                tries -= 1

        if not len(tweets):
            raise Exception('Could not download any tweets')

        matching_tweets = self.filter_tweets_matching_keyword(tweets, keyword)
        print('Received {} tweets, {} of them matched the keyword {}.'.format(len(tweets), len(matching_tweets), keyword))
        # logg this instead of printing

        if not matching_tweets:
            if not last_fetched_id:
                # logg it!
                raise Exception('This topic ({}) has not appeared in twitter for 7 days.'.format(keyword))
            else:
                raise Exception('There are new tweets about ({}).'.format(keyword))
        else:
            formatted = self.extract_data_to_json_format(tweets)
            self.append_to_file(formatted, keyword, last_fetched_id)


    def request_tweets(self, keyword, last_fetched_id):
        """
        Requests tweets in pack of 100 (maximum allowed) applying filters.\n
        Reads the newest tweets that haven't been fetched yet.
        :returns: tweets received from twitter requested for a keyword
        """
        tweets = None

        try:
            if last_fetched_id:
                print(last_fetched_id)
                tweets = self.api.search(q='"'+keyword+'"'+self.filters, count=100, result_type='recent', since_id=last_fetched_id,
                                         tweet_mode='extended', include_entities=False)
            else:
                tweets = self.api.search(q='"'+keyword+'"'+self.filters, count=100, result_type='recent',
                                         tweet_mode='extended', include_entities=False)
            return tweets

        except tweepy.error.TweepError as error:
            if error.response.text == 'status code = 503' and retry <= 3:
                print('Server overloaded, waiting 1 sec...')
                sleep(1)
                return None
            else:
                print(error.response.text)
                raise Exception('Could not load tweets from Twitter.')

        except JSONDecodeError:  # tweepy unhandled exception
            if retry > 3:  # we dont want to make a deadlock, but a few tries may be helpful
                # logg this!
                raise Exception('Could not handle the tweets content.')
            print('\x1b[1;31;40mParsing error occured. Retrying.\x1b[0m\n')
            return None


    @staticmethod
    def get_last_fetched_id(keyword):
        """
        Loads query limiting id from file and returns it.\n
        :param since: Switches between limiter we want to load from file since_id/max_id
        :returns: last_fetched_id - newest tweet id for a given topic already fetched
        """
        line = None
        test_number = 0
        if not path.exists('outputs/'+keyword+'.txt'):
            return None
        while test_number < 3:  # tries 3 times, because sometimes first try was unsuccessful for some reason
            try:
                line = str(check_output(['head', '-1', 'outputs/'+keyword+'.txt'])).lstrip('b"{ ').rstrip(' }\\n\"')
                test_number = 3
            except CalledProcessError:
                test_number += 1
                print('Could not load last_fetched_id from a file (attempt {})'.format(test_number+1))

        if line is not None:
            return int(TweetFetcher.unwrap_line_to_dictionary(line)['id'])  # sets since_id, its exclusive
        else:
            return None


    @staticmethod
    def filter_tweets_matching_keyword(tweets, keyword):
        """
        Checks tweets for containing keyword in their text.\n
        :param tweets: tweets to check\n
        :param keyword: keyword to check the tweets for\n
        :return: tweets that meet the keyword criteria
        """
        matching = []
        for tweet in tweets:
            if keyword in tweet.full_text.lower():
                matching.append(tweet)
        return matching


    @staticmethod
    def extract_data_to_json_format(tweets):
        """
        Extracts list of tweets into a json formatted dictionary.\n
        :param tweets: tweets to extract into dictionary
        :return: json-style dictionary containing tweets
        """
        json_style = {'tweets': []}

        for tweet in tweets:  # [::-1]:
            json_style['tweets'].append({
                'id': tweet.id,
                'date': tweet.created_at,
                'screen_name': tweet.user.screen_name,
                'full_text': tweet.full_text.replace('\n', ' ')  # for some reason some tweets still break the line
            })
        return json_style


    @staticmethod
    def append_to_file(data, keyword, existing):
        """
        Saves tweets at the end of a respective file.\n
        :param data: json-formatted tweets dictionary
        """
        try:
            if not path.exists('outputs'):
                mkdir('outputs')

            with open('outputs/' + keyword + '_head.txt' if existing else
                      'outputs/' + keyword + '.txt', 'a') as output:
                for tweet in data['tweets']:
                    buffer = '{ '
                    key_number = 1
                    for key in tweet:
                        buffer += '\'' + str(key) + '\':' + '\'' + str(tweet[key]) + '\''
                        if key_number < len(tweet.keys()):
                            buffer += ', '
                        else:
                            buffer += ' }\n'
                        key_number += 1
                    output.write(buffer)
            if existing:
                TweetFetcher.merge_output_files(keyword)
        except Exception:
            # logg the failure
            raise Exception('Could not save the downloaded tweets to a file.')


    @staticmethod
    def merge_output_files(keyword):
        """
        Merges two files containing tweets of the same topic.\n
        Reads topic file line by line and attaches it to topic_head, then removes topic file and changes head's name.\n
        """

        try:
            with open('outputs/' + keyword + '.txt', 'r') as input_handle:
                with open('outputs/' + keyword + '_head.txt', 'a') as output_handle:
                    for line in input_handle:
                        output_handle.write(line)
                    output_handle.close()
                input_handle.close()
            remove('outputs/' + keyword + '.txt')
            rename('outputs/' + keyword + '_head.txt', 'outputs/' + keyword + '.txt')
        except FileNotFoundError:
            raise Exception('Could not save the downloaded tweets to a file.')



if __name__ == '__main__':
    lurk = TweetFetcher()
    lurk.authenticate()
    lurk.get_tweets("school")
