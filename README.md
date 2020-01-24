# Overview

This is an authentication and access control reverse-proxy for the SONG Overture service that is used by the research center.

The reverse-proxy assumes that a valid encrypted jwt token was already generated by another service and that it is decryptable with the secret it has.

# Project Structure

- src/utils: Directory containing various pure functional utilities the code makes use of. Unit tests are provided in the same directory to test those utilities.
- src/middleware: Directory containing middleware generating functions that will be used to get the token and perform access control in the routes
- src/index.js: Entrypoint of the code where the following tasks are perform:
  - Defining the routes
  - Booting the server
  - Parametrizing higher order functions with impure dependencies and project-specific parameters
- src/config.js: Script that fetches the project's configurations from        environment variables
- src/proxy.js: Provides generic higher order utility methods to forward requests to remote targets.
- src/Dockerfile: Dockerfile to build a production image of the project
- src/Dockerfile-dev: Dockerfile to build a dev-friendly image of the project. The image runs with nodemon, so it will automatically restart the service with code changes.
- docker-compose.yml: Development orchestration of the project to troubleshoot

# Usage

To launch the dependent services, run: ./launch_services.sh

Look at the **.env** file for the credentials

To run the (yet to be implemented) integration tests, run: ./run_tests.sh