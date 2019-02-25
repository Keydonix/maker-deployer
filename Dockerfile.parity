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
COPY --from=builder /home/parity/chains /home/parity/chains

COPY --from=builder /maker-deployer/output/contracts /contracts

USER root
RUN chown -R parity /home/parity

USER parity

# docker image build . -t keydonix/parity-instantseal-maker
