#!/bin/bash
# Axeon Whidbey Environment Framework for POSIX (Linux/macOS)
# Copyright 2026 KitSixtyFour. For internal Axeon use only.

# To run: "source ./tools/lin/whidbey.sh" without quotations

# Capture the true script file location context immediately
export WhdScript="${BASH_SOURCE[0]}"
if [ -z "$WhdScript" ]; then
    WhdScript="$0"
fi

# Internal routing engine hooks
if [ "$1" = "show_help" ]; then
    _whd_show_help
    return 0
elif [ "$1" = "run_prep" ]; then
    _whd_run_prep
    return 0
fi

clear

if [[ "$OSTYPE" == "darwin"* ]]; then
    winver="macOS $(sw_vers -productVersion 2>/dev/null)"
    copyown="Apple Inc"
else
    winver="Linux $(uname -r 2>/dev/null)"
    copyown="The Linux Authors & Others"
fi

echo "$winver"
echo "Axeon Whidbey Development Environment Version 4.0"
echo "Copyright (c) $copyown. Portions (c) Axeon Network."
echo ""

# Initialize default environment properties
export WhdPrivateBuild="no"
export WhdIsDeltaEnabled="yes"
export WhdBuildType=""

# Loop through command line arguments in any order
while [ "$#" -gt 0 ]; do
    case "$(echo "$1" | tr '[:upper:]' '[:lower:]')" in
        checked)
            export WhdBuildType="chk"
            ;;
        free)
            export WhdBuildType="fre"
            ;;
        private)
            export WhdPrivateBuild="yes"
            ;;
        nodelta)
            export WhdIsDeltaEnabled="no"
            ;;
    esac
    shift
done

# Default build configuration rules
if [ -z "$WhdBuildType" ]; then
    export WhdBuildType="chk"
fi

if [ "$WhdBuildType" = "chk" ]; then
    status="Checked"
else
    status="Retail"
fi

# Read current branch lab properties via Git
lab=$(git rev-parse --abbrev-ref HEAD 2>/dev/null)
if [ -z "$lab" ]; then
    lab="PANTHER_${USER:-dummy}"
fi

# Set the console title wrapper block dynamically
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo -n -e "\033]0;Axeon Whidbey ~ Och $status from DevLab $lab inside $(pwd)\007"
else
    echo -n -e "\033]2;Axeon Whidbey ~ Och $status from DevLab $lab inside $(pwd)\007"
fi

_whd_run_prep() {
    # Orchid Repository Pipeline Pushes
    pushd "$OrchidSource" > /dev/null
    git add .
    read -p "What would you like to name your commit for Orchid? " OchCommitName
    read -p "Would you like to add a description to your commit? (Y/N): " akn_desc_yn
    if [[ "$akn_desc_yn" =~ ^[Yy]$ ]]; then
        read -p "Enter the commit description: " OchCommitDesc
        git commit -m "$OchCommitName" -m "$OchCommitDesc"
    else
        git commit -m "$OchCommitName"
    fi
    git push
    popd > /dev/null

    unset OchCommitName OchCommitDesc
    echo ""
    echo "Done."
}

_whd_show_help() {
    echo ""
    echo "Axeon Whidbey Version 4.0 for Linux/macOS"
    echo "Copyright 2026 KitSixtyFour. For internal Axeon use only"
    echo ""
    echo ""
    echo "Commands:"
    echo "          npminst              - install missing npm packages"
    echo "          och                  - run Orchid normally"
    echo "          och -dc              - run Orchid (Discord only)"
    echo "          och -st              - run Orchid (Stoat only)"
    echo "          och -fx              - run Orchid (Fluxer only)"
    echo "          dply                 - deploy commands to discord as slash commands"
    echo "          track                - track ALL files for git"
    echo "          commit \"arg\"         - commit current work."
    echo "          commit \"arg\" \"arg2\"  - same as commit but \"arg2\" is an extended description"
    echo "          pull                 - pull changes from github"
    echo "          push                 - push work to github"
    echo "          whelp                - print this message"
    echo ""
}

# Global Session Shell Command Maps
whelp() { _whd_show_help; }
prep() { _whd_run_prep; }
npminst() { npm install; }
dply() { node tools/deploycmds.js; }
track() { git add .; }
pull() { git pull; }
push() { git push; }

commit() {
    if [ -z "$2" ]; then
        git commit -m "$1"
    else
        git commit -m "$1" -m "$2"
    fi
}

och() {
    if [ "$1" = "-dc" ]; then
        node bot.js --discord
    elif [ "$1" = "-st" ]; then
        node bot.js --stoat
    elif [ "$1" = "-fx" ]; then
        node bot.js --fluxer
    else
        node bot.js
    fi
}