#!/usr/bin/env bash
# Axeon Whidbey Environment Framework for *NIX
# Copyright 2026 KitSixtyFour. For internal Axeon use only.

WHD_SCRIPT="$(realpath "${BASH_SOURCE[0]}")"

WHD_VERSION="5"
WHD_VERSION_NO_EX="${WHD_VERSION}.0"
WHD_VERSION_FLOAT="${WHD_VERSION_NO_EX}0"
WHD_VERSION_BUILD="2010"
WHD_VERSION_BUILD_EX="${WHD_VERSION_BUILD}.main.260826-1347"
WHD_VERSION_MODE="ReleaseUniversal"
WHD_VERSION_COMPOSITED="${WHD_VERSION_FLOAT}.${WHD_VERSION_BUILD_EX}"
WHD_DEV_PHS=""

WHD_MAGIC_KEY="AXEONWHIDBEY${WHD_VERSION}"
WHD_MAGIC_NUMBER="5274"
WHD_CONFIG_HEADER="${WHD_MAGIC_KEY}:::${WHD_MAGIC_NUMBER}"

WHD_CONFIG_FILE="whidbey.ini"

# AKANE SPECIFIC CONFIGURATION (Irrelevant for Orchid)

# Helper to read INI configurations
# load_config() {
#    local target="${1:-$WHD_CONFIG_FILE}"
#    if [ -f "$target" ]; then
#        if ! grep -q "$WHD_CONFIG_HEADER" "$target"; then
#            echo "Your configuration file is not compatible with this version of Whidbey. Please make a new configuration file or upgrade the old one."
#            return 1
#        fi
        
#        local current_sec=""
#        while IFS= read -r line || [ -n "$line" ]; do
#            line="$(echo "$line" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')"
#            [[ -z "$line" || "$line" =~ ^# ]] && continue
            
#            if [[ "$line" =~ ^\[.*\]$ ]]; then
#               current_sec="$line"
#            elif [[ "$line" =~ = ]]; then
#                local key="${line%%=*}"
#                local val="${line#*=}"
#                key="$(echo "$key" | tr -d ' ')"
                
#                if [ "$current_sec" = "[AxeonAkane]" ]; then
#                    [ "$key" = "ArticlePath" ] && SourceArticles="$val"
#                    [ "$key" = "ImgPath" ] && SourceMedia="$val"
#                    [ "$key" = "SourcePath" ] && OrchidSource="$val"
#                elif [ "$current_sec" = "[AxeonMedia]" ]; then
#                    [ "$key" = "SourcePath" ] && AxeonMedia="$val"
#                fi
#            fi
#        done < "$target"
#    fi
#}

# save_config() {
#    local target="${1:-$WHD_CONFIG_FILE}"
#    cat <<EOF > "$target"
#$WHD_CONFIG_HEADER
#[AxeonAkane]
#ArticlePath=$SourceArticles
#ImgPath=$SourceMedia
#SourcePath=$OrchidSource

#[AxeonMedia]
#SourcePath=$AxeonMedia
#EOF
#}

# upgrade_config() {
#    local target="$1"
#    local upg_articles="" upg_media="" upg_akane="" upg_axeon=""
#    local current_sec=""

#    while IFS= read -r line || [ -n "$line" ]; do
#        line="$(echo "$line" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')"
#        [[ -z "$line" || "$line" =~ ^# ]] && continue
        
#        if [[ "$line" =~ ^\[.*\]$ ]]; then
#            current_sec="$line"
#        elif [[ "$line" =~ = ]]; then
#            local key="${line%%=*}"
#            local val="${line#*=}"
#            key="$(echo "$key" | tr -d ' ')"
            
#            if [ "$current_sec" = "[AxeonAkane]" ]; then
#                [ "$key" = "ArticlePath" ] && upg_articles="$val"
#                [ "$key" = "ImgPath" ] && upg_media="$val"
#                [ "$key" = "SourcePath" ] && upg_akane="$val"
#           elif [ "$current_sec" = "[AxeonMedia]" ]; then
#                [ "$key" = "SourcePath" ] && upg_axeon="$val"
#            fi
#        fi
#    done < "$target"

#    cat <<EOF > "$target"
# $WHD_CONFIG_HEADER
# [AxeonAkane]
# ArticlePath=$upg_articles
# ImgPath=$upg_media
# SourcePath=$upg_akane

# [AxeonMedia]
# SourcePath=$upg_axeon
# EOF
#    echo "The configuration file $target has been upgraded to match Whidbey's magic keys."
#}

#ensure_paths() {
#    local paths_ok="Y"
#    [ -z "$AxeonMedia" ] && paths_ok="N"
#    [ -z "$OrchidSource" ] && paths_ok="N"
#    [ -z "$SourceArticles" ] && paths_ok="N"
#    [ -z "$SourceMedia" ] && paths_ok="N"

#    if [ "$paths_ok" = "Y" ]; then
#        echo ""
#        echo "Current config:"
#        echo "     AxeonMedia     = $AxeonMedia"
#        echo "     OrchidSource    = $OrchidSource"
#        echo "     SourceArticles = $SourceArticles"
#        echo "     SourceMedia    = $SourceMedia"
#        echo ""
#        read -rp "Is this configuration correct? (Y/N): " chk_reply
#        if [[ "$chk_reply" =~ ^[Yy]$ ]]; then
#            return 0
#        fi
#    fi

#    echo ""
#   read -rp "Where is the AxeonMedia repository located?: " AxeonMedia
#    read -rp "Is the current directory a valid Axeon Akane source code packet? (Y/N): " is_curr
#    if [[ "$is_curr" =~ ^[Yy]$ ]]; then
#        OrchidSource="$(pwd)"
#    else
#        read -rp "Akane path: " OrchidSource
#    fi
#    read -rp "Inside the Akane packet, where are the articles located?: " SourceArticles
#    read -rp "Inside the Akane packet, where are the images located?: " SourceMedia
#    save_config
# }

show_help() {
    echo ""
    echo "Whidbey current supports 10 commands with 7 arguments."
    echo ""
    echo " Command [Arguments]:                 Description:"
    echo "  npminst                              install missing npm packages"
    echo "  och  [-dc  -st]                      run Orchid"
    echo "                                        * \"-dc\" starts Discord ONLY."
    echo "                                        * \"-st\" starts Stoat ONLY."
    echo "  dply \"clientID\"                    deploy commands to Discord as slash commands." 
    echo "  prep                                 sync and push packet to git."
    echo "  track                                tracks any current packet changes"
    echo "                                        * alias of 'git add .'."
    echo "  pull                                 pulls any changes from the web packet"
    echo "                                        * alias of 'git pull'."
    echo "  push                                 pushes the local packet to the web"
    echo "                                        * alias of 'git push'."
    echo "  commit \"msg\" \"desc\"                  commits current packet to git."
    echo "  whidbey config [new  modify  save    manage a loaded whidbey config:"
    echo "                  upgrade  load]        * \"new\" makes a new config file and"
    echo "                                          saves it to 'whidbey.ini'."
    echo "                                        * \"modify\" changes the current config."
    echo "                                        * \"save\" saves the current config to"
    echo "                                          'whidbey.ini'."
    echo "                                        * \"upgrade\" upgrades a config file to"
    echo "                                          match Whidbey's magic keys."
    echo "                                        * \"load\" loads a config file."
    echo "  whidbey about                        show the about dialogue"
    echo "  whidbey stop                         unload any whidbey-related things"
    echo ""
}

show_about() {
    local uname_str
    uname_str="$(uname -a 2>/dev/null)"
    local winver=""
    local copyown=""

    if [[ "$OSTYPE" == "darwin"* ]]; then
        winver="macOS $(sw_vers -productVersion 2>/dev/null)"
        copyown="Apple Inc."
    elif [[ "$uname_str" == *"FreeBSD"* ]]; then
        winver="FreeBSD $(uname -r 2>/dev/null)"
        copyown="The FreeBSD Project"
    elif [[ "$uname_str" == *"OpenBSD"* ]]; then
        winver="OpenBSD $(uname -r 2>/dev/null)"
        copyown="The OpenBSD Project"
    elif [[ "$uname_str" == *"NetBSD"* ]]; then
        winver="NetBSD $(uname -r 2>/dev/null)"
        copyown="The NetBSD Foundation, Inc."
    elif [[ "$uname_str" == *"DragonFly"* ]]; then
        winver="DragonFly BSD $(uname -r 2>/dev/null)"
        copyown="The DragonFly Project"
    elif [[ "$uname_str" == *"Haiku"* ]]; then
        winver="Haiku $(uname -r 2>/dev/null)"
        copyown="Haiku, Inc."
    elif [[ "$uname_str" == *"MSYS"* ]]; then
        winver="MSYS2 for Microsoft Windows $(uname -r 2>/dev/null)"
        copyown="The MSYS2 Project"
    else
        winver="GNU/Linux (or other) $(uname -r 2>/dev/null)"
        copyown="The GNU/Linux Authors & Others"
    fi

    local archtemp="${PROCESSOR_ARCHITEW6432:-$(uname -m)}"
    local arch=""
    local archline2=""

    if [ "$archtemp" = "ia64" ] || [ "$archtemp" = "IA64" ]; then
        arch="for Intel Itanic,"
        archline2="(I mean, Itanium) IA-64"
    elif [ "$archtemp" = "x86_64" ] || [ "$archtemp" = "AMD64" ]; then
        arch="AMD64"
    elif [ "$archtemp" = "i386" ] || [ "$archtemp" = "i686" ] || [ "$archtemp" = "x86" ]; then
        arch="x86"
    else
        arch="$archtemp"
    fi

    echo "Axeon Whidbey Development Environment and Framework"
    echo "Version $WHD_VERSION_FLOAT $WHD_DEV_PHS (Build $WHD_VERSION_BUILD_EX $WHD_VERSION_MODE)"
    echo ""
    echo "Running under $winver $arch"
    [ -n "$archline2" ] && echo "$archline2"
    echo "Copyright (C) $copyown. All Rights Reserved."
    echo ""
    echo ""
    echo "The Whidbey Environment is meant for internal use only."
    echo "Copyright (C) 2026 Axeon Network. Developed by KitSixtyFour"
    echo ""
    echo "Check us out over at https://axeon-network.github.io if you want more goodies!"
}

run_config() {
    local subcmd="$1"
    local cfg_file="$2"

    if [ -z "$subcmd" ]; then
        echo "You need to append an argument to this command:"
        echo "    new:                make a new configuration file."
        echo "    upgrade <file>:    upgrade a config file."
        echo "    modify [file]:      modify a config file, or the"
        echo "                        currently loaded config."
        echo "    save:               save loaded config to whidbey.ini."
        echo "    load <file>:        load a Whidbey configuration."
        return 1
    fi

    case "$(echo "$subcmd" | tr '[:upper:]' '[:lower:]')" in
        new)
            AxeonMedia="" OrchidSource="" SourceArticles="" SourceMedia=""
            ensure_paths
            save_config "$WHD_CONFIG_FILE"
            load_config "$WHD_CONFIG_FILE"
            echo "Configuration created and loaded."
            ;;
        load)
            if [ -z "$cfg_file" ]; then
                echo "Please specify a configuration file to load."
                return 1
            fi
            if [ ! -f "$cfg_file" ]; then
                echo "$cfg_file does not exist."
                return 1
            fi
            if ! grep -q -E "AXEONWHIDBEY|\[AxeonAkane\]" "$cfg_file"; then
                echo "This is not a Whidbey configuration file."
                return 1
            fi
            load_config "$cfg_file"
            echo "Loaded configuration from $cfg_file."
            ;;
        upgrade)
            if [ -z "$cfg_file" ]; then
                echo "Please specify a configuration file to upgrade."
                return 1
            fi
            if [ ! -f "$cfg_file" ]; then
                echo "$cfg_file does not exist."
                return 1
            fi
            if ! grep -q -E "AXEONWHIDBEY|\[AxeonAkane\]" "$cfg_file"; then
                echo "This is not a Whidbey configuration file."
                return 1
            fi
            if grep -q "$WHD_CONFIG_HEADER" "$cfg_file"; then
                echo "This configuration file does not need to be upgraded."
            else
                upgrade_config "$cfg_file"
                load_config "$cfg_file"
            fi
            ;;
        modify)
            if [ -n "$cfg_file" ]; then
                if [ ! -f "$cfg_file" ]; then
                    echo "$cfg_file does not exist."
                    return 1
                fi
                load_config "$cfg_file"
                ensure_paths
                save_config "$cfg_file"
                load_config "$cfg_file"
            else
                [ -f "$WHD_CONFIG_FILE" ] && load_config "$WHD_CONFIG_FILE"
                ensure_paths
                save_config "$WHD_CONFIG_FILE"
            fi
            ;;
        save)
            if [ -z "$AxeonMedia" ]; then
                echo "No active configuration in memory to save."
                return 1
            fi
            save_config "$WHD_CONFIG_FILE"
            echo "Configuration saved to $WHD_CONFIG_FILE"
            ;;
        *)
            echo "Unknown configuration subcommand: $subcmd"
            ;;
    esac
}

synch() {
    load_config "$WHD_CONFIG_FILE"
    ensure_paths

    [ ! -d "$OrchidSource" ] && { echo "The directory does not exist: \"$OrchidSource\""; return 1; }
    [ ! -d "$AxeonMedia" ] && { echo "The directory does not exist: \"$AxeonMedia\""; return 1; }

    local synced=0

    if [ -d "$OrchidSource/$SourceMedia" ]; then
        mkdir -p "$AxeonMedia/kuro/img/"
        cp -rf "$OrchidSource/$SourceMedia/"* "$AxeonMedia/kuro/img/" 2>/dev/null
        ((synced++))
    else
        echo "The directory \"$OrchidSource/$SourceMedia\" was not found."
    fi

    if [ -d "$OrchidSource/$SourceArticles" ]; then
        mkdir -p "$AxeonMedia/kuro/articles/"
        cp -rf "$OrchidSource/$SourceArticles/"* "$AxeonMedia/kuro/articles/" 2>/dev/null
        ((synced++))
    else
        echo "The directory \"$OrchidSource/$SourceArticles\" was not found."
    fi

    if [ "$synced" -gt 0 ]; then
        echo "Axeon Akane and Axeon Media have been synched successfully."
    else
        echo "No source directories were found to sync."
    fi
}

run_prep() {
    load_config "$WHD_CONFIG_FILE"
    ensure_paths
#    cp -rf "$OrchidSource/$SourceMedia/"* "$AxeonMedia/kuro/img/" 2>/dev/null
#    cp -rf "$OrchidSource/$SourceArticles/"* "$AxeonMedia/kuro/articles/" 2>/dev/null

    pushd "$OrchidSource" >/dev/null || return
    git add .
    read -rp "What would you like to name the commit for Orchid?: " OchCommitName
    read -rp "Do you want to add description? (Y/N): " och_desc_yn
    if [[ "$och_desc_yn" =~ ^[Yy]$ ]]; then
        read -rp "Description: " OchCommitDesc
        git commit -m "$OchCommitName" -m "$OchCommitDesc"
    else
        git commit -m "$OchCommitName"
    fi
    git push
    popd >/dev/null || return

#    pushd "$AxeonMedia" >/dev/null || return
#    git add .
#    read -rp "What would you like to name the commit for AxeonMedia?: " MdaCommitName
#    read -rp "Do you want to add description? (Y/N): " mda_desc_yn
#    if [[ "$mda_desc_yn" =~ ^[Yy]$ ]]; then
#        read -rp "Description: " MdaCommitDesc
#        git commit -m "$MdaCommitName" -m "$MdaCommitDesc"
#    else
#        git commit -m "$MdaCommitName"
#    fi
#    git push
#    popd >/dev/null || return
}

run_och() {
    shift
    case "$1" in
        -dc) node bot.js --discord ;;
        -st) node bot.js --stoat ;;
        *) node bot.js ;;
    esac
}

run_search() {
    local err_idx=$((RANDOM % 12))
    local errs=(
        "Error 0xCD: We can't find what you're looking for on the internet, please try looking for it on physical media instead."
        "Error 0x40: Your processor is either too slow or too damn fast to parse this. Please try on an Intel Core A Duo H467 instead."
        "Error 0xAA: Our servers have been infected by the Win32.AEmoji malware. Please try again later."
        "Error 0x50: Can't decide if you're looking for books or ducks that know the answer. Please clear up your mind."
        "Error 0x64: We can't process this request at this time. Please try again in a Nintendo 64."
        "Error 0x06: Our servers are under maintenance mode. However, the server admins might be too busy barking or meowing instead of fixing the problem. Please try again sometime on September 17, 2027."
        "Error 0x70: The answer to this query has been redacted by the United States of America's Federal Bureau of Investigation. Please try searching for something else."
        "Error 0x10: We tried to deliver the results to you, but your ISP was too hungry and it ate instead. Sorry about that."
        "Error 0x03: Our servers are having a hard time processing your request since they are still running on Windows Server 2003. Please give them some time."
        "Error 0xB4: Whidbey cannot deliver this request since it reminded them of their ex. Please try another query."
        "Error 0xDF: Woof!"
        "Error 0xDE: Meow!"
    )
    echo "${errs[$err_idx]}"
}

get_processor() {
    echo "Whidbey is querying your computer's information..."
    sleep 5
    local cpu_idx=$((RANDOM % 32))
    local cpus=(
        "Intel(R) Core(TM)A Solo CPU E640 @ 2.00GHz" "Intel(R) Core(TM)A Solo CPU E840 @ 2.00GHz"
        "Intel(R) Core(TM)A Solo CPU N920 @ 2.00GHz" "Intel(R) Core(TM)A Solo CPU W650 @ 2.00GHz"
        "Intel(R) Core(TM)A Solo CPU S250 @ 2.00GHz" "Intel(R) Core(TM)A Solo CPU I357 @ 2.00GHz"
        "Intel(R) Core(TM)A Solo CPU H467 @ 2.00GHz" "Intel(R) Core(TM)A Solo CPU B577 @ 2.00GHz"
        "Intel(R) Core(TM)A Duo CPU E640 @ 2.00GHz"  "Intel(R) Core(TM)A Duo CPU E840 @ 2.00GHz"
        "Intel(R) Core(TM)A Duo CPU N920 @ 2.00GHz"  "Intel(R) Core(TM)A Duo CPU W650 @ 2.00GHz"
        "Intel(R) Core(TM)A Duo CPU S250 @ 2.00GHz"  "Intel(R) Core(TM)A Duo CPU I357 @ 2.00GHz"
        "Intel(R) Core(TM)A Duo CPU H467 @ 2.00GHz"  "Intel(R) Core(TM)A Duo CPU B577 @ 2.00GHz"
        "Intel(R) Core(TM)A Quad CPU E640 @ 2.50GHz" "Intel(R) Core(TM)A Quad CPU E840 @ 2.50GHz"
        "Intel(R) Core(TM)A Quad CPU N920 @ 2.50GHz" "Intel(R) Core(TM)A Quad CPU W650 @ 2.50GHz"
        "Intel(R) Core(TM)A Quad CPU S250 @ 2.50GHz" "Intel(R) Core(TM)A Quad CPU I357 @ 2.50GHz"
        "Intel(R) Core(TM)A Quad CPU H467 @ 2.50GHz" "Intel(R) Core(TM)A Quad CPU B577 @ 2.50GHz"
        "Intel(R) Core(TM)A Extreme CPU E630 @ 2.60GHz" "Intel(R) Core(TM)A Extreme CPU E840 @ 2.60GHz"
        "Intel(R) Core(TM)A Extreme CPU N920 @ 2.60GHz" "Intel(R) Core(TM)A Extreme CPU W650 @ 2.60GHz"
        "Intel(R) Core(TM)A Extreme CPU S250 @ 2.60GHz" "Intel(R) Core(TM)A Extreme CPU I357 @ 2.60GHz"
        "Intel(R) Core(TM)A Extreme CPU H467 @ 2.60GHz" "Intel(R) Core(TM)A Extreme CPU B577 @ 2.60GHz"
    )
    echo "Running on an ${cpus[$cpu_idx]}"
}

showerthought() {
    local st_idx=$((RANDOM % 21))
    local thoughts=(
        "People hate Sundays because of Mondays."
        "Friday is close to Monday, but Monday is far from Friday."
        "Does Lightning McQueen get life insurance or car insurance?"
        "You learn to read before you read to learn."
        "Why does the the brain ignore the second 'the'?"
        "What does the fox say?"
        "If Todd uses the same model as Robin Hood, is Robin Hood actually just Todd?"
        "No mirror is brand new."
        "The bigger the bedroom is, the smaller the bedroom is."
        "If love is blind, why is there love at first sight?"
        "The platform Discord is known for having drama in it, so it lives up to its name."
        "If there is a Windows Vista, why isn't there a Windows Tacto?"
        "If Life is a Highway, how long would the road be?"
        "Has Google actually reached a googol of indexed pages?"
        "How are cars born in the Cars universe?"
        "Since Mario & Luigi: Bowser's Inside Story takes place after Partners in Time, are the B.I.S. Mario and Luigi the baby versions or the grown-up versions?"
        "If you replace 'W' with 'T' in Where, What, and When, you answer the question."
        "If you're waiting for a waiter at a restaurant, doesn't that make you the waiter?"
        "Firefighters use water, but watercraft firefighters use water from under the water."
        "Your stomach thinks all potato chips are crushed immediately."
        "If electricity comes from electrons, does morality come from morons?"
    )
    echo "${thoughts[$st_idx]}"
}

# Process Subcommands / Easter Eggs
if [ -n "$1" ]; then
    case "$(echo "$1" | tr '[:upper:]' '[:lower:]')" in
        help|show_help) show_help; exit 0 ;;
        sync) synch; exit 0 ;;
        about|show_about) show_about; exit 0 ;;
        stop|run_stop) echo "Unloading Whidbey environment..."; exit 0 ;;
        och|run_och) run_och "$@"; exit 0 ;;
        prep|run_prep) run_prep; exit 0 ;;
        commit|run_commit)
            if [ -z "$3" ]; then
                git commit -m "$2"
            else
                git commit -m "$2" -m "$3"
            fi
            exit 0
            ;;
        config|run_config) run_config "$2" "$3"; exit $? ;;
        upgrade) run_config upgrade "$2"; exit $? ;;

        # Easter eggs
        hello) echo "Hello there! :3"; exit 0 ;;
        motivate) echo "Nice work! Keep going dude! :D"; exit 0 ;;
        beep) printf '\aBoop!\n'; exit 0 ;;
        woof) echo "Woof!"; exit 0 ;;
        meow) echo "Meow!"; exit 0 ;;
        a|aemoji) echo "A? A!"; exit 0 ;;
        sample) echo "Project Arctic 2002 and Nexus32, coming [[REDACTED]]!"; exit 0 ;;
        search) run_search; exit 0 ;;
        showerthought) showerthought; exit 0 ;;
        get)
            if [ "$(echo "$2" | tr '[:upper:]' '[:lower:]')" = "processor" ]; then
                get_processor
            else
                echo "What do you want me to get? Your 'processor'?"
            fi
            exit 0
            ;;
        fetch)
            if [ "$(echo "$2" | tr '[:upper:]' '[:lower:]')" = "stick" ]; then
                if [ "$(echo "$3" | tr '[:upper:]' '[:lower:]')" = "please" ]; then
                    echo "Woof woof! *nom*"
                else
                    echo "I'm not a dog to fetch a stupid stick!"
                fi
                exit 0
            fi
            ;;
    esac
fi

load_config "$WHD_CONFIG_FILE"

clear

    uname_str2="$(uname -a 2>/dev/null)"
    winver2=""
    copyown2=""

    if [[ "$OSTYPE" == "darwin"* ]]; then
        winver2="macOS $(sw_vers -productVersion 2>/dev/null)"
        copyown2="Apple Inc."
    elif [[ "$uname_str2" == *"FreeBSD"* ]]; then
        winver2="FreeBSD $(uname -r 2>/dev/null)"
        copyown2="The FreeBSD Project"
    elif [[ "$uname_str2" == *"OpenBSD"* ]]; then
        winver2="OpenBSD $(uname -r 2>/dev/null)"
        copyown="The OpenBSD Project"
    elif [[ "$uname_str2" == *"NetBSD"* ]]; then
        winver2="NetBSD $(uname -r 2>/dev/null)"
        copyown2="The NetBSD Foundation, Inc."
    elif [[ "$uname_str2" == *"DragonFly"* ]]; then
        winver2="DragonFly BSD $(uname -r 2>/dev/null)"
        copyown2="The DragonFly Project"
    elif [[ "$uname_str2" == *"Haiku"* ]]; then
        winver2="Haiku $(uname -r 2>/dev/null)"
        copyown2="Haiku, Inc."
    elif [[ "$uname_str2" == *"MSYS"* ]]; then
        winver2="MSYS2 for Microsoft Windows $(uname -r 2>/dev/null)"
        copyown2="The MSYS2 Project"
    else
        winver2="GNU/Linux (or other) $(uname -r 2>/dev/null)"
        copyown2="The GNU/Linux Authors & Others"
    fi
echo "$winver2"
echo "Axeon Whidbey Development Environment $WHD_DEV_PHS Version $WHD_VERSION (Build $WHD_VERSION_BUILD)"
echo "Copyright (c) $copyown2. Portions (c) Axeon Network."
echo ""

WHD_BUILD_TYPE="chk"
WHD_PRIVATE_BUILD="no"
WHD_IS_DELTA_ENABLED="no"

# Parse flags (checked, free, private, nodelta)
while [ -n "$1" ]; do
    case "$(echo "$1" | tr '[:upper:]' '[:lower:]')" in
        checked) WHD_BUILD_TYPE="chk" ;;
        free) WHD_BUILD_TYPE="fre" ;;
        private) WHD_PRIVATE_BUILD="yes" ;;
        nodelta) WHD_IS_DELTA_ENABLED="no" ;;
        *)
            echo "Unknown command or option: \"$1\""
            echo "Type \"whidbey help\" for a list of available commands."
            exit 1
            ;;
    esac
    shift
done

if [ "$WHD_BUILD_TYPE" = "chk" ]; then
    WhdStatus="Checked"
else
    WhdStatus="Retail"
fi

WhdLab=""
WhdLab="$(git rev-parse --abbrev-ref HEAD 2>/dev/null)"
if [ -z "$WhdLab" ] && [ -n "$OrchidSource" ] && [ -d "$OrchidSource" ]; then
    WhdLab="$(git -C "$OrchidSource" rev-parse --abbrev-ref HEAD 2>/dev/null)"
fi
[ -z "$WhdLab" ] && WhdLab="PANTHER_${USER:-$(whoami)}"

echo -ne "\033]0;Axeon Whidbey ~ Och $WhdStatus from DevLab $WhdLab inside $(pwd)\007"

# read -rp "Would you like to sync Akane with AxeonMedia? (Y/N): " start_sync
# if [[ "$start_sync" =~ ^[Yy]$ ]]; then
#    ensure_paths
#    if [ -d "$OrchidSource/$SourceMedia" ]; then
#        mkdir -p "$AxeonMedia/kuro/img/"
#        cp -rf "$OrchidSource/$SourceMedia/"* "$AxeonMedia/kuro/img/" 2>/dev/null
#    fi
#    if [ -d "$OrchidSource/$SourceArticles" ]; then
#        mkdir -p "$AxeonMedia/kuro/articles/"
#        cp -rf "$OrchidSource/$SourceArticles/"* "$AxeonMedia/kuro/articles/" 2>/dev/null
#    fi
#    echo "Axeon Akane and Axeon Media have been synched successfully."
#    echo ""
# fi

# Set bash aliases
alias whelp="\"$WHD_SCRIPT\" help"
alias prep="\"$WHD_SCRIPT\" prep"
alias npminst="npm install"
alias och="\"$WHD_SCRIPT\" och"
alias dply="node tools/deploycmds.js "$@""
alias track="git add ."
alias commit="\"$WHD_SCRIPT\" commit"
alias pull="git pull"
alias push="git push"
alias whidbey="\"$WHD_SCRIPT\""