# Description
The goal of our application is to bring random individuals together for shared parties. We are going to have a login and register pages that are connected to a database. With this we will also have a profile for each user allowing people to upload pictures/have previous parties on their page.

On the discover page, we would like to have a map representing all of the parties going on based on geographic location. In addition, we want users to be able to post,delete, and comment on other parties. On those posts we will allow users to edit their posts with how many people can come and who is invited. In addition, we are going to add a filter so you can search for parties specifically based on location, type, theme, size of party.


# Contributers
## Team 016-05
|Name               |Github        |Email                     |
|-------------------|------------- |--------------------------|
|Zoie Nuño          |wyntersmith   |zonu9746@colorado.edu     |
|Nolan Lee          |NolanLee100101|nole5800@colorado.edu     |
|Hayden Schlichting |Haydebug      |Hasc5772@colorado.edu     |
|Aidan St. Cyr      |aist9379      |aist9379@colorado.edu     |
|Dan Medvedev       |DanielMed1620 |dame0706@colorado.edu     |
|Ali Almutawa Jr.   |PiCake314     |alal5051@colorado.edu     |

# Technology Stack
## Operating Systems and Programming Languages
- Javascript

## Servers
- Microsoft Azure

## Data Storage and Querying
- PostgresSQL

## Backend Framework
- Node.js
- Axios
- Chai
- Mocha

## Frontend Framework
- Bootstrap
- CSS
- EJS

## API Services
- Mapbox


# Prerequisites
- docker

# Instructions on Running Application Locally
To run the the application locally, download and open the repository in your IDE. 
In the terminal, run the command:
```
docker-compose up -d
```
To close the application, run the command:
```
docker compose down -v
```

# Running Tests
To run the test cases, run the following command in the terminal:
```
docker-compose run web npm run testandrun
```

# Deployment Link
http://recitation-016-team-05.eastus.cloudapp.azure.com:3000/login