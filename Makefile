run:
	docker run --rm -it \
		--name framed \
		-p 80:80 \
		-p 443:443 \
		jchorl/framed

run-dev:
	docker run --rm -it \
		--name framed \
		-p 80:80 \
		-p 443:443 \
		-v $(PWD):/framed \
		-w /framed \
		jchorl/framed \
		bash

build:
	docker build -t jchorl/framed .
