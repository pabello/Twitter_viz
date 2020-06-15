from sys import argv

if __name__ == '__main__':
    if len(argv) == 1:
        print('Pass a file name in argument, i.e. pyhton3 word_sorter.py \'path/file.txt\'')
        print('For safety reasons remember to create a backup of original file.')
        exit()

    path = argv[1]
    words = []

    try:
        with open(path, 'r') as file:
            for line in file:
                if not line in words:
                    words.append(line.strip())
    except:
        print('Could not load the specified file :(')
        print('Please check if given path was correct.')

    try:
        words_sorted = sorted(words, key=lambda x: x)
        with open(path, 'w') as file:
            for word in words_sorted:
                file.write(word + '\n')
    except:
        print('Encountered an error when trying to save sorted output.')

    print('Your file have been sorted :)')
