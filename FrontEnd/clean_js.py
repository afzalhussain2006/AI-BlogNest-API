import re
import sys

def remove_comments(code):
    pattern = r"""
        (?P<string>
            " (?: \\. | [^"\\] )* " |
            ' (?: \\. | [^'\\] )* ' |
            ` (?: \\. | [^`\\] )* `
        )
        |
        (?P<multiline_comment> /\* .*? \*/ )
        |
        (?P<singleline_comment> // [^\n]* )
    """
    regex = re.compile(pattern, re.VERBOSE | re.DOTALL)

    def replacer(match):
        if match.group('string') is not None:
            return match.group('string')
        else:
            return ""

    return regex.sub(replacer, code)

def clean_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    content = remove_comments(content)

    lines = [line.rstrip() for line in content.split('\n')]

    cleaned_lines = []
    blank_count = 0
    for line in lines:
        if line == '':
            blank_count += 1
            if blank_count <= 1:
                cleaned_lines.append(line)
        else:
            blank_count = 0
            cleaned_lines.append(line)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write('\n'.join(cleaned_lines) + '\n')

files = [
    r"d:\NM26\2026-09-26\2026-09-26\NM\FrontEnd\js\cursor.js",
    r"d:\NM26\2026-09-26\2026-09-26\NM\FrontEnd\js\login.js",
    r"d:\NM26\2026-09-26\2026-09-26\NM\FrontEnd\js\register.js",
    r"d:\NM26\2026-09-26\2026-09-26\NM\FrontEnd\js\main.js",
    r"d:\NM26\2026-09-26\2026-09-26\NM\FrontEnd\js\theme.js",
    r"d:\NM26\2026-09-26\2026-09-26\NM\FrontEnd\js\loader.js"
]

for f in files:
    try:
        clean_file(f)
        print(f"Cleaned {f}")
    except Exception as e:
        print(f"Error cleaning {f}: {e}")
