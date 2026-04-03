# E Hotels

## Setup

### Prerequisite: Install Docker
Skip this step if your system already has docker installed and go directly to [starting the project](#start-the-project).

#### Windows
Follow the instructions to [install and integrate docker desktop with wsl](https://docs.docker.com/desktop/features/wsl/).  

We recommend installing the Ubuntu distribution. If you already have wsl but not the correct distribution, you can install it with `wsl --install Ubuntu`

Note: if you have wsl installed but **do not want to install docker desktop** follow the instructions for [installing docker on Ubuntu](#linux) inside a wsl terminal.  

You can test for whether the distribution is default with wsl by running `wsl -l --all`. If the distribution you are planning to use is not the default (running the list command does not show "Default" in brackets beside the distro name), you will need to follow the instructions to [allow integration between that distribution and docker desktop](https://docs.docker.com/desktop/features/wsl/#enable-docker-in-a-wsl-2-distribution) at step 2.

Once wsl is setup, run wsl in a terminal using
```
wsl --distribution Ubuntu
```

Run all future commands in wsl.

#### Linux
To test whether docker is installed run `docker --help`. If the command is not recognised, you will need to install docker.

Follow the instructions to [install docker and docker compose using apt](https://docs.docker.com/engine/install/ubuntu/).  

#### MacOS
Follow the instructions to [install docker desktop](https://docs.docker.com/desktop/setup/install/mac-install/).

### Start the project
After cloning the repo, in the project top level directory (i.e. `/path/to/the/repo/csi2132-ehotel/`).

#### Step 1: Environment Variables
Set the environment variables by adding them to a .env file. Format for the .env file is key-value pairs in the form `ENV_VAR=value`. If a .env file does not already exist, create it in the top level directory. The environment variables used by the application are listed along with their description and default values in backend/readme.md 

DB_PASSWORD is the only required variable. It cannot be empty.

Sample .env file
```
DB_NAME=ehoteldb
DB_USER=postgres
DB_PASSWORD=change-me!
```

#### Step 2: Run with Compose
Compose builds and runs the entire project
```
sudo docker compose -f docker-compose.frontend.yaml -f docker-compose.server.yaml up --build
```

Go to http://localhost:5173 to explore the web application!  


To run just the backend in order to interact with the database
```
sudo docker compose -f docker-compose.server.yaml up --build
```

To interact with the backend api, use curl or a fetch library in your favourite language. If you have postgres installed, you can connect to the database directly at localhost:5432 using pgadmin or psql (`psql $DB_NAME -U $DB_USER`)

### Stop the project
To stop the project cleanly use docker compose to remove any containers / volumes / networks.

```
sudo docker compose -f docker-compose.frontend.yaml -f docker-compose.server.yaml down -v
```

Note: db initialisation only occurs if a postgres data volume does not exist (i.e. the project was torn down properly with docker compose)
