from bs4 import BeautifulSoup
import os
import re
import json


def insert_line_after_pattern(filepath, pattern, custom_code):
    with open(filepath, 'r') as file:
        data = file.read()

    occurrences = re.findall(pattern, data)

    # Ensure that the pattern is found exactly once
    if len(occurrences) != 1:
        print(f'Pattern {pattern} found {len(occurrences)} times. It should be found exactly once.')
        return

    # Find the position of the pattern in the file
    pattern_index = data.find(pattern)

    # Find the end of the line containing the pattern
    end_of_line_index = data.find('\n', pattern_index)

    # Insert the custom code after this line
    new_data = data[:end_of_line_index] + '\n' + custom_code + data[end_of_line_index:]

    # Write the modified data back to the file
    with open(filepath, 'w') as file:
        file.write(new_data)

def replace_strings_with_regex(file_path, new_path):
    # This is the regular expression that finds the "*.json"
    regex_pattern = re.compile(r'"(.*\.json)"')

    # Open the file
    with open(file_path, 'r') as file:
        content = file.read()

    # Replace "*.json" with "new_path/*.json"
    replaced_content = re.sub(regex_pattern, f'"{new_path}\\1"', content)
    print(replaced_content)

    # Write the replaced content back into the file
    with open(file_path, 'w') as file:
        file.write(replaced_content)

def prepend_url(data):
    for key, value in data.items():
        if isinstance(value, dict):
            # Recursive call if value is a dictionary
            prepend_url(value)
        # Replace value if key is 'url'
        elif "url" in key:
            if public_url not in value:
                data[key] = public_url + data[key]

def prepend_url_in_config(config_path):
    with open(config_path, "r") as config_file:
        data = json.load(config_file)

    prepend_url(data)

    with open(config_path, "w") as config_file:
        json.dump(data, config_file, indent=4)

def process_html():
    with open("index.html", "r") as f:
        contents = f.read()
    soup = BeautifulSoup(contents, 'html.parser')
    head = soup.find('head')
    # all <script> under <head>
    scripts = head.find_all('script')
    print(scripts)
    for script in scripts:
        script['src'] = public_url + script['src']

    # all <script> under <head>
    body = soup.find('body')
    scripts = body.find_all('script')

    with open('__codepen__.js', 'w') as output:
        for script in scripts:
            try:
                file_path = script['src']
                with open(file_path, 'r') as file:
                    content = file.read()
                    output.write(content)
            except Exception as e:
                print(e)

    scripts[0]['src'] = '__codepen__.js'
    for script in scripts[1:]:
        script.decompose()

    with open("modified_file.html", "w") as f:
        f.write(str(soup))

if __name__ == '__main__':
    repo_name = 'iphone-visualization' #sys.argv[1]
    public_url = f"https://playcanvas-public.s3.amazonaws.com/{repo_name}/" 

    process_html()
    insert_line_after_pattern('__codepen__.js', 'app.start()', '// INSERT_CODE')
    replace_strings_with_regex("__settings__.js", new_path=public_url)
    prepend_url_in_config("./config.json")
