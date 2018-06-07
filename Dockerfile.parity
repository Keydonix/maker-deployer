FROM keydonix/parity-instantseal-node8 as builder
# TODO: use digest

# TODO: vendor
RUN apt-get update && apt-get -y install software-properties-common git make && \
	add-apt-repository ppa:ethereum/ethereum && \
	apt-get update && \
	apt-get install -y solc

COPY . /maker-deployer

WORKDIR /maker-deployer

RUN /maker-deployer/scripts/run-parity-and-deploy.sh

WORKDIR /


FROM keydonix/parity-instantseal
COPY --from=builder /parity/chains /parity/chains

# docker image build . -t keydonix/parity-instantseal-maker
