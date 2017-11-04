# Contributing Guide

## Contributors
At the moment, road-sign-manager is developed by a student team at Code4Good at Yale University. However, feel free to create issues and open pull requests.

## Instructions
1. `git clone` the repository if you haven't already.
2. Make sure you are on the `master` branch with `git status`.
3. `git pull` to pull the latest updates.
4. `git checkout -b <BRANCH NAME>` to checkout a new feature/issue branch. Name the branch after your feature/issue.
5. Make the changes and test them locally. Remember to install dependencies with `yarn` else you will get a `module not found` error. When testing, remember to make a COPY of `.env.sample` and name it `.env` before filling out the environment variables.
6. When you are ready to submit, `git add .` `git commit -m "<CHANGES MADE>"` `git push origin <BRANCH NAME>`. DO NOT push to `origin master`.
7. Open a pull request on Github and assign @spaceraccoon as the reviewer. In your message, remember to add `#<ISSUE NUMBER>` so that the request automatically closes the issue when it is merged.
8. @spaceraccoon will either approve or suggest changes. If the latter, repeat steps 5-6.
