run:
	docker run --rm -it \
		--name framed \
		-p 8080:8080 \
		-v $(PWD):/framed \
		-w /framed \
		jchorl/framed \
		dev_appserver.py --host=0.0.0.0 --threadsafe_override=false .

build:
	docker build -f Dockerfile. -t jchorl/framed .

ui:
	docker run --rm -it \
		--name uibuild \
		-v $(PWD)/ui:/ui \
		-w /ui \
		node \
		npm run build

ui-dev:
	docker run --rm -it \
		--name uibuild \
		-p 3000:3000 \
		-v $(PWD)/ui:/ui \
		--link framed:framed \
		-w /ui \
		node \
		npm start

.PHONY: run build ui ui-dev
