FROM python:2.7

RUN apt-get update && apt-get install -y apt-transport-https && \
	echo "deb https://packages.cloud.google.com/apt cloud-sdk-jessie main" | tee /etc/apt/sources.list.d/google-cloud-sdk.list && \
	curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | apt-key add - && \
	apt-get update && apt-get install -y google-cloud-sdk google-cloud-sdk-app-engine-python google-cloud-sdk-datastore-emulator

ADD . /framed
WORKDIR /framed

CMD bash
