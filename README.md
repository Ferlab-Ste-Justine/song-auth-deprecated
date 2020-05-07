![](https://github.com/cr-ste-justine/song-auth/workflows/Build/badge.svg)
![](https://github.com/cr-ste-justine/song-auth/workflows/Publish/badge.svg)

# Overview

This is a reverse-proxy that operates in front of the SONG service.

Its main purpose is to perform custom authentication and access control outside of the Score codebase.

Additionally, it calls an external service (definable via the **SAMPLE_METADATA_SERVICE** environment variable) to get the full metadata payload of samples when uploading analyses.

Other simple adaptations are acceptable, although anything that is very project-specific (ie, access to databases) should be moved to an external service so that this reverse-proxy can remain applicable across projets.

All requests to the SONG service should pass through this reverse-proxy first.

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