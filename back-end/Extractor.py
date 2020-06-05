import json

from os import path, mkdir
from Functions import unwrap_line_to_dictionary

"""
This module is designed to conduct a simple semantic analysis on gathered tweets
on certain topic. It finds the most popular words related with the topics and
creates a hierarchy structure drescribing connections between them.
Output is stored in a .json file.
"""

def save_the_analysis(topic, hierarchy):
    """
    Saving hierarchy structure to a .json files\n
    @param topic - topic of the analysis, makes the file title\n
    @param hierarchy - the structure produced in analysis process
    """
    if not hierarchy:
        return
    if not path.exists('analyses'):
        mkdir('analyses')

    with open('analyses/' + topic + '.json', 'w') as file:
        json.dump(hierarchy, file, indent=3, ensure_ascii=False)


def analyze(topic):
    """
    Analyzes the tweets for the topic.\n
    First it counts occurences of every word and chooses top 50.
    Then checks connections between words and stores outcome to a file.
    """

    # load tweets
    with open('outputs/' + topic + '.txt', 'r') as file:
        file_content = [unwrap_line_to_dictionary(line) for line in file]
    # load word blacklist
    with open('assets/word_blacklist.txt', 'r') as file:
        blacklist = [line.strip() for line in file]
    # get the tweets words thet are not in the blacklist
    tweets_words = [extract_tweet_words(tweet, blacklist) for tweet in file_content]


    # count the words occurences
    words = {}
    for tweet in tweets_words:
        for word in tweet:
            if word in words.keys():
                words[word] += 1
            else:
                words[word] = 1

    # put the words into a sorted list
    word_list = [[word, words[word]] for word in words]
    word_list = sorted(word_list, key=lambda row: row[1], reverse=True)

    # select top50 most popular and put them into hierarchy
    top50 = word_list[:50]
    hierarchy = {'words' : [ {'word':word[0], 'appearances': word[1], 'connections':[]} for word in top50 ]}

    # find connections
    # for every word in hierarchy
    for node in hierarchy['words']:
        anchor = node['word']
        matches = []  # stores words that have already appeared
        # checks all tweets containing it
        for tweet in tweets_words:
            if anchor in tweet:
                # gets all co-apprearing words without repeats
                for word in tweet:
                    if not word == anchor and word not in matches:
                        node['connections'].append({'word':word})
                        matches.append(word)

    save_the_analysis(topic, hierarchy)


def extract_tweet_words(tweet, blacklist=None):
    tokens = tweet['full_text'].lower()\
            .replace(',', '').replace('.', '').replace('!', '')\
            .replace('?', '').replace('"', '').replace('\u2019', '\'')\
            .replace('\' ', ' ').replace(';', ' ').replace('\u2018', ' ')\
            .replace('*', ' ').replace(': ', ' ').replace(' (', ' ')\
            .replace(') ', ' ').replace(' -', ' ').replace('i\'', ' I\'')\
            .split()
    words = [word.strip('"\'()[]{}!.?/\\|') for word in tokens if len(word)>2 and\
             word[0] not in '@#$&' and 'http' not in word]
    if blacklist:
        words = [word for word in words if word not in blacklist]
    return words


def check_bot(tweet):
    '''
    Checks if the tweet was posted by a bot with some level of certainity.
    '''
    name = tweet['screen_name'].strip('1234567890').lower()
    return ('iembot' in name or name[:3] == 'bot' or name[-3:] == 'bot')


if __name__ == '__main__':
    analyze('school')
    pass
