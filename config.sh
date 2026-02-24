#!/bin/bash

FULL_NAME="Rishikesh Anand"
GITHUB_USER="blakeinstein"
REPO_NAME="search-ai-core"
sed -i.mybak "s/\([\/\"]\)(ryansonshine)/$GITHUB_USER/g; s/typescript-npm-package-template\|my-package-name/$REPO_NAME/g; s/Ryan Sonshine/$FULL_NAME/g" package.json package-lock.json README.md
rm *.mybak