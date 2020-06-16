def unwrap_line_to_dictionary(line):
    '''
    Gets a line containing tweet data and returns it in a form of a dictionary\n
    :param line: line to turn into a dictionary
    :return: dictionary form of passed line (tweet)
    '''
    # preprocessing done for posts containing i.e. quotes
    if line[0] == '\'':
        line = line.strip('\'').rstrip('\\n')
    if line[2] == '\\':
        line = line.replace('\\', '')

    line = line.lstrip('{ \'').rstrip('\' }')
    tweet = dict()
    for pair in line.split('\', \''):
        pair = pair.split('\':\'')
        tweet[pair[0]] = pair[1]
    return tweet
