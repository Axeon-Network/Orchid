:: Axeon Whidbey Environment Framework for Microsoft Windows DOS/NT
:: Copyright 2026 KitSixtyFour. For internal Axeon use only.

@echo off
set "WhdScript=%~f0"

if "%1"=="show_help" goto show_help
if "%1"=="run_och" goto run_och
if "%1"=="run_commit" goto run_commit

setlocal enabledelayedexpansion

for /f "tokens=*" %%i in ('ver') do set "winver=%%i"
set "winver=%winver:[=%"
set "winver=%winver:]=%"

cls
echo %winver%
echo Axeon Whidbey Development Environment Version 4.0
echo Copyright (c) Microsoft Corp. Portions (c) Axeon Network.
echo.

set "WhdPrivateBuild=no"
set "WhdIsDeltaEnabled=no"
set "WhdBuildType="

:arg_loop
if "%~1"==" " goto end_arg_loop
if "%~1"=="" goto end_arg_loop
set "arg=%~1"
if /i "!arg!"=="checked" set "WhdBuildType=chk"
if /i "!arg!"=="free" set "WhdBuildType=fre"
if /i "!arg!"=="private" set "WhdPrivateBuild=yes"
if /i "!arg!"=="nodelta" set "WhdIsDeltaEnabled=no"
shift /1
goto arg_loop
:end_arg_loop

if "!WhdBuildType!"=="" set "WhdBuildType=chk"

if "!WhdBuildType!"=="chk" (
    set "status=Checked"
) else (
    set "status=Retail"
)

for /f "tokens=*" %%i in ('git rev-parse --abbrev-ref HEAD 2^>nul') do set "lab=%%i"
if "%lab%"=="" set "lab=PANTHER_%username%"

title Axeon Whidbey ~ och !status! from DevLab !lab! inside %cd%

doskey whelp="%WhdScript%" show_help
doskey npminst=npm install
doskey och="%WhdScript%" run_och $*
doskey dply=node tools/deploycmds.js $*
doskey track=git add .
doskey commit="%WhdScript%" run_commit $*
doskey pull=git pull
doskey push=git push

endlocal & set "status=%status%" & set "lab=%lab%" & set "WhdBuildType=%WhdBuildType%" & set "WhdPrivateBuild=%WhdPrivateBuild%" & set "WhdIsDeltaEnabled=%WhdIsDeltaEnabled%" & set "AkaneSource=%AkaneSource%" & set "AxeonMedia=%AxeonMedia%" & set "SourceArticles=%SourceArticles%" & set "SourceMedia=%SourceMedia%"
exit /b

:run_och
setlocal enabledelayedexpansion
set "flag=%~2"
if /i "!flag!"=="-dc" (
    node bot.js --discord
) else if /i "!flag!"=="-st" (
    node bot.js --stoat
) else (
    set "raw_args=%*"
    set "forward_args=!raw_args:*run_och=!"
    node bot.js
)
endlocal
exit /b


:run_commit
if "%~3"=="" (
    git commit -m %2
) else (
    git commit -m %2 -m %3
)
exit /b


:show_help
echo.
echo Axeon Whidbey Version 4.0 for Microsoft(R) Windows(R)
echo Copyright 2026 KitSixtyFour. For internal Axeon use only
echo.
echo.
echo Commands:
echo           npminst              - install missing npm packages
echo           och                  - run Orchid normally
echo           och -dc              - run Orchid (Discord only)
echo           och -st              - run Orchid (Stoat only)
echo           dply "clientID"      - deploy commands to discord as slash commands
echo           track                - track ALL files for git
echo           commit "arg"         - commit current work.
echo           commit "arg" "arg2"  - same as commit but "arg2" is an extended description
echo           pull                 - pull changes from github
echo           push                 - push work to github
echo           whelp                - print this message
exit /b