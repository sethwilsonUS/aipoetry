# Welcome to AI Poetry

## Overview

This is a barebones web app with one purpose: to share one new AI-generated poem each hour. The poems are generated from a wide variety of topics and an array of poetic styles. It's my hope this app will provide some amusement, whether it be from appreciating a great verse or turn of phrase, or, more often than not, having a good laugh at AI's limits of versification. Moreover, I hope readers will come away with a deepened appreciation for the diversity of poetic forms.

Note this is a work in progress. The app will likely always remain lightweight and stay true to this original purpose, but there are numerous improvements I'd like to make.

That's where you come in! This project is open-source, so you're more than welcome to contribute!

## Development

If you want to work on the app, you'll need your own OpenAI API key (or feel free to play around with other models if you'd like, up to you). You can set this up at [https://platform.openai.com](https://platform.openai.com).

### Quickstart

Clone this repository

```
git clone https://github.com/sethwilsonUS/aipoetry.git
```

cd into the development directory and run `yarn` to install dependencies.

Rename `.env.example` to `.env.local`. It should look something like this:

```
OPENAI_API_KEY=sk-proj-xxxxxxxx
NO_CACHE=true
```

The `OPENAI_API_KEY` field is where you'll place your API key that you got from OpenAI's platform page. Note that this means you will be charged each time the app fgenerates a random poem. The amount may seem small but it can add up quickly if you're not careful.

The `NO_CACHE` field lets you develop on the app without connecting to the KV Redis cache I use for the actual app. But to my above point, realize that in this mode the app will generate a new poem on every refresh.

Of course, you're welcome to create a Vercel account and set up your own KV store of your own if you want to test out that functionality.

Finally, start the app by running `yarn dev`. You can now connect to it by opening a browser and browsing to `http://localhost:3000`.

## Contributing

Please feel free to open a Pull Request if you want to contribute a feature, or just some potential poem topics/styles. Topics are easy to contribute and just involve adding them to the relevant string array. Styles are a bit more involved; I will write up a guide on those later.

All pull requests should be made against the `next` branch. This is the preview branch. Once a change has been approved and merged, it will then be merged into `main` and thus the deployed app. But do not make PRs against `main` directly--they will be summarily closed.

### Topics

Here are some common-sense guidelines for submitting topics:

- no offensive topics
- no topics that discriminate by race, sex, ethnicity, or other demographic
- no political or religious topics
- I reserve the right to reject topics for other reasons not listed

Thanks!