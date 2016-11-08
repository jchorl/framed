FROM python:2.7

RUN pip install --upgrade google-api-python-client beautifulsoup4 lxml
ADD . /framed
WORKDIR /framed

CMD python main.py
