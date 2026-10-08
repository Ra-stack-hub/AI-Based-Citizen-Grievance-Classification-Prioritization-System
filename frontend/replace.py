import os
import re

def replace_in_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    original = content
    
    # Text colors
    content = content.replace('text-white', 'text-textPrimary')
    content = content.replace('text-textSecondary/50', 'text-textSecondary')
    
    # Borders
    content = re.sub(r'border-white/10', 'border-borderLight', content)
    content = re.sub(r'border-white/5', 'border-borderLight', content)
    content = re.sub(r'border-white/20', 'border-borderLight', content)
    
    # Backgrounds
    content = re.sub(r'bg-surface/40', 'bg-surface shadow-sm', content)
    content = re.sub(r'bg-surface/50', 'bg-surface shadow-sm', content)
    content = re.sub(r'bg-surface/80', 'bg-surface shadow-md', content)
    
    content = re.sub(r'bg-surfaceLight/10', 'bg-surfaceLight', content)
    content = re.sub(r'bg-surfaceLight/20', 'bg-surfaceLight', content)
    content = re.sub(r'bg-surfaceLight/30', 'bg-surfaceLight', content)
    content = re.sub(r'bg-surfaceLight/40', 'bg-surfaceLight shadow-sm', content)
    
    # Hover states
    content = re.sub(r'hover:bg-white/5', 'hover:bg-surfaceLight', content)
    content = re.sub(r'hover:bg-white/10', 'hover:bg-surfaceLight', content)
    
    # Scrollbar
    content = re.sub(r'\[&::-webkit-scrollbar-thumb\]:bg-white/10', '[&::-webkit-scrollbar-thumb]:bg-borderLight', content)
    content = re.sub(r'\[&::-webkit-scrollbar-thumb\]:hover:bg-white/20', '[&::-webkit-scrollbar-thumb]:hover:bg-textSecondary', content)

    if original != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'Updated {filepath}')

def main():
    src_dir = r'c:\Users\raksh\OneDrive\Documents\Desktop\major project\frontend\src'
    for root, dirs, files in os.walk(src_dir):
        for file in files:
            if file.endswith(('.tsx', '.ts', '.jsx', '.js')):
                replace_in_file(os.path.join(root, file))

if __name__ == '__main__':
    main()
