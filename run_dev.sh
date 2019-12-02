docker build -t test:test .;
docker run -it --rm -v $(pwd):/opt/app test:test sh