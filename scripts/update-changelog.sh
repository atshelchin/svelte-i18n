#!/bin/bash

# Update CHANGELOG files with current date and version from package.json

# Get current date
CURRENT_DATE=$(date +%Y-%m-%d)

# Get version from package.json
VERSION=$(node -p "require('./package.json').version")

# Clean version (remove -dev suffix if present)
CLEAN_VERSION=${VERSION%%-*}

echo "📝 Updating CHANGELOG files"
echo "   Version: $CLEAN_VERSION"
echo "   Date: $CURRENT_DATE"

# Function to update a changelog file
update_changelog() {
    local file=$1
    local file_name=$(basename $file)
    
    echo ""
    echo "📄 Processing $file_name..."
    
    # Update the unreleased section to the current version and date
    if grep -q "## \[Unreleased\]" "$file"; then
        # If there's an unreleased section, convert it to the new version
        sed -i.bak "s/## \[Unreleased\]/## [$CLEAN_VERSION] - $CURRENT_DATE/" "$file"
        echo "   ✅ Updated Unreleased section to [$CLEAN_VERSION] - $CURRENT_DATE"
    else
        # Check if current version already exists
        if grep -q "## \[$CLEAN_VERSION\]" "$file"; then
            # Update the date for existing version
            sed -i.bak "s/## \[$CLEAN_VERSION\] - .*/## [$CLEAN_VERSION] - $CURRENT_DATE/" "$file"
            echo "   ✅ Updated date for existing version [$CLEAN_VERSION]"
        else
            echo "   ⚠️  No Unreleased section found and version [$CLEAN_VERSION] already exists"
        fi
    fi
    
    # Clean up backup file
    rm -f "${file}.bak"
}

# Update both CHANGELOG files
update_changelog "CHANGELOG.md"
update_changelog "CHANGELOG_zh.md"

echo ""
echo "✨ All CHANGELOG files updated successfully"