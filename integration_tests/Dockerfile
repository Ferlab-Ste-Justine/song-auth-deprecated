FROM python:3

WORKDIR /opt/

RUN mkdir -p /opt/song-sdk && \
    cd /opt/song-sdk && git clone https://github.com/cr-ste-justine/SONG.git && \
    cd SONG && git fetch && git checkout stable && \
    cd song-python-sdk && pip install -r requirements.txt && python setup.py install

COPY . /opt/integration_tests/

WORKDIR /opt/integration_tests/

RUN pip install -r requirements.txt

CMD ["python", "__init__.py"]