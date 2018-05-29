FROM keydonix/parity-instantseal-node8
# TODO: use digest

# TODO: vendor
RUN apt-get update && apt-get -y install software-properties-common git make && \
	add-apt-repository ppa:ethereum/ethereum && \
	apt-get update && \
	apt-get install -y solc

COPY . /build/maker-docker-poa

WORKDIR /build/maker-docker-poa

RUN npm install
RUN npm run build:source
RUN npm run build:contracts
RUN npm run build:interfaces
