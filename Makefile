run:
	docker container run --rm -it \
		--name framed \
		-p 8080:8080 \
		-v $(PWD):/framed \
		-w /framed \
		jchorl/framed \
		dev_appserver.py --host=0.0.0.0 --threadsafe_override=false .

build:
	docker image build -f Dockerfile.d -t jchorl/framed .

ui:
	docker container run --rm -it \
		--name uibuild \
		-v $(PWD)/ui:/ui \
		-w /ui \
		node \
		sh -c "npm install; npm run build"

ui-dev:
	docker container run --rm -it \
		--name uibuild \
		-p 3000:3000 \
		-v $(PWD)/ui:/ui \
		--link framed:framed \
		-w /ui \
		node \
		sh -c "npm install; npm start"

deploy:
	docker container run --rm -it \
		-v $(PWD):/framed \
		-w /framed \
		google/cloud-sdk \
		sh -c "gcloud auth login; gcloud --project=framed-17 app deploy"

.PHONY: run build ui ui-dev
