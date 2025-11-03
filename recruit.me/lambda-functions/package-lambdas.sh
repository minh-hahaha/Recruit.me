#!/bin/bash

# Script to package each Lambda function folder into a zip file
# Each zip contains: all .js files from the folder (at root level), config.js, db-utils.js, package.json, and node_modules

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Ensure output directory exists
OUTPUT_DIR="Zip Files"
mkdir -p "$OUTPUT_DIR"

# Install dependencies first
echo "Installing npm dependencies..."
npm install 
if [ $? -ne 0 ]; then
    echo "✗ npm install failed!"
    exit 1
fi
echo "✓ Dependencies installed"
echo ""

# Find all directories (excluding node_modules and current directory)
for folder in */; do
    # Remove trailing slash
    folder_name="${folder%/}"
    
    # Skip node_modules and other non-lambda folders
    if [[ "$folder_name" == "node_modules" ]]; then
        continue
    fi
    # Skip output directory
    if [[ "$folder_name" == "$OUTPUT_DIR" ]]; then
        continue
    fi
    
    # Skip if folder doesn't exist
    if [ ! -d "$folder_name" ]; then
        continue
    fi
    
    # Find .js files in the folder
    js_files=$(find "$folder_name" -name "*.js" -o -name "*.mjs" 2>/dev/null)
    
    # Skip if no JS files found
    if [ -z "$js_files" ]; then
        echo "No .js/.mjs files found in $folder_name, skipping..."
        continue
    fi
    
    # Create zip file name
    zip_name="${folder_name}.zip"
    zip_path="${OUTPUT_DIR}/${zip_name}"
    
    # Remove existing zip if it exists
    if [ -f "$zip_path" ]; then
        echo "Deleting existing $zip_path..."
        rm "$zip_path"
    fi
    
    # Create zip with all files at root level (using -j flag to junk paths)
    echo "Packaging $folder_name..."
    # Add JS files, config, db-utils, and package.json at root level
    zip -j "$zip_path" $js_files config.mjs db-utils.mjs package.json
    
    # Add node_modules with directory structure (if it exists)
    if [ -d "node_modules" ]; then
        zip -r "$zip_path" node_modules/
    fi
    
    if [ $? -eq 0 ]; then
        echo "✓ Created $zip_path"
    else
        echo "✗ Failed to create $zip_path"
    fi
done

echo ""
echo "Done packaging Lambda functions!"

