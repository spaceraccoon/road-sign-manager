# Road Sign Manager

## Introduction
Road Sign Manager is a Code4Good at Yale, MakeHaven and New Haven collaborative project to create a cloud platform that can convert and send data to electronic road signs in the city. The project is developed by a team of student developers.

## Installation and Usage
1. `git clone` the repository.
2. `yarn` or `npm install`.
3. Rename `.env.sample` to `.env` and set the variables accordingly. Note that `DATABASE_URL` is for the production database; the test and development databases use sqlite and run from memory or a file respectively. You can ignore `DATABASE_URL` if you don't plan to deploy yet.
4. `yarn dev` or `npm run dev` for development.
5. If you want to run on the production database, use `yarn start` or `npm start`.
6. `yarn test` or `npm test` to run tests.

## Deploy
[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

## Contributing
At the moment, road-sign-manager is developed by a student team at Code4Good at Yale University. However, feel free to create issues and open pull requests.

1. `git clone` the repository if you haven't already.
2. Make sure you are on the `master` branch with `git status`.
3. `git pull` to pull the latest updates.
4. `git checkout -b <BRANCH NAME>` to checkout a new feature/issue branch. Name the branch after your feature/issue.
5. Make the changes and test them locally. Remember to install dependencies with `yarn` else you will get a `module not found` error. When testing, remember to make a COPY of `.env.sample` and name it `.env` before filling out the environment variables.
6. Before proceeding to submit, run `yarn precommit` or `npm run precommit` as well as `yarn test`/`npm run test`.
7. When you are ready to submit, `git add .` `git commit -m "<CHANGES MADE>"` `git push origin <BRANCH NAME>`. DO NOT push to `origin master`.
8. Open a pull request on Github and assign @spaceraccoon as the reviewer. In your message, remember to add `#<ISSUE NUMBER>` so that the request automatically closes the issue when it is merged.
9. @spaceraccoon will either approve or suggest changes. If the latter, repeat steps 5-6.

