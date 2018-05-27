FROM keydonix/parity-instantseal
# TODO: use digest

WORKDIR /build

# TODO: vendor
RUN apt-get update && apt-get -y install software-properties-common git make && \
	add-apt-repository ppa:ethereum/ethereum && \
	apt-get update && \
	apt-get install -y solc

RUN git clone https://github.com/makerdao/sai.git && \
	( cd sai && \
	git checkout 56eed66bb42a485ff0819f4ca227f615b1eb5320 && \
	git submodule update --init --recursive )

RUN mkdir artifacts && mkdir tools && cd tools && \
	git clone https://github.com/dapphub/dapp && \
	(cd dapp && git checkout a426596705be4dfcdd60e7965163453574459dcf) && \
	make install -C dapp prefix=/build/artifacts

ENV PATH="/build/artifacts/bin:${PATH}"

WORKDIR /build/sai

RUN dapp build

WORKDIR /
