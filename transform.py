import os
import re
import json

def replace_strings_with_regex(directory, file_pattern, new_path):
    # This is the regular expression that finds the "*.json"
    regex_pattern = re.compile(r'(\*\.json)')

    # Walk through the directory
    for dirpath, dirnames, filenames in os.walk(directory):
        for filename in filenames:
            if filename.endswith('.json') or filename.endswith('.js'):
                if filename.startswith('playcanvas') or filename.startswith('ammo'):
                    continue
                if 'files/assets' in dirpath:
                    continue

                print(dirpath, filename)
                file_path = os.path.join(dirpath, filename)

                # Open the file
                with open(file_path, 'r') as file:
                    content = file.read()

                # Replace "*.json" with "new_path/*.json"
                replaced_content = re.sub(regex_pattern, f'{new_path}/\\1', content)

                # Write the replaced content back into the file
                with open(file_path, 'w') as file:
                    file.write(replaced_content)

import json

def replace_url(data, replace_value):
    for key, value in data.items():
        if isinstance(value, dict):
            # Recursive call if value is a dictionary
            replace_url(value, replace_value)
        elif "url" in key:
            if "https://playcanvas-public.s3.amazonaws.com/test-playcanvas/" in value:
                continue
            # Replace value if key is 'url'
            data[key] = "https://playcanvas-public.s3.amazonaws.com/test-playcanvas/" + data[key]

def replace_url_in_config(config_path, replace_value):
    with open(config_path, "r") as config_file:
        data = json.load(config_file)

    replace_url(data, replace_value)

    with open(config_path, "w") as config_file:
        json.dump(data, config_file, indent=4)

replace_url_in_config("./config.json", "new_url_value")
