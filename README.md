# HCMUT Timetable Scraper with Node.js, Puppeteer, and Express

This is a simple `Node.js` application that demonstrates how to scrape data from HCMUT's timetable website using `Puppeteer` and expose it through a RESTful API using `Express`.

## Pre-requisites

Before you begin, ensure you have met the following requirements:

- You have installed the latest version of `Node.js` and `npm`.
- You have a `Windows`, `Linux`, or `Mac` machine.

## Installation

1. Clone this repository to your local machine:

```bash
   git clone https://github.com/mercenarioZ/HCMUT_schedule_api.git
```
2. Install the dependencies:

```bash
   npm install
```
3. Config the environment variables:

```bash
   cp .env.example .env
```
Then open `.env` file, change the `USER_NAME`, `PASSWORD` variable to your own.

4. Start the server:
```bash
   npm start
```

## Usage

To get the schedule of yours, send a `GET` request to `/` by using `curl` or `Postman`:

```bash
   curl http://localhost:8080/
```
