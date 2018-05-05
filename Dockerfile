FROM parity/parity:v1.9.7

ADD ./key.json /tmp/keystore/
ADD ./setup_8.x /tmp/

RUN bash /tmp/setup_8.x

WORKDIR /build

RUN apt-get -y install software-properties-common git bc nodejs build-essential && \
	add-apt-repository ppa:ethereum/ethereum && \
	add-apt-repository ppa:gophers/archive && \
	apt-get update && \
	apt-get install -y solc libjansson-dev golang-1.8 cargo

RUN git clone https://github.com/makerdao/sai.git && \
	( cd sai && \
	git checkout 56eed66bb42a485ff0819f4ca227f615b1eb5320 && \
	git submodule update --init --recursive )

# steps to install Nix and DappHub tools
RUN mkdir artifacts && mkdir makertools && cd makertools && \
	git clone https://github.com/dapphub/seth && \
	(cd seth && git checkout de7048815c4953da391b93179af9c2c162e59b23) && \
	git clone https://github.com/dapphub/dapp && \
	(cd dapp && git checkout a426596705be4dfcdd60e7965163453574459dcf) && \
	git clone https://github.com/dapphub/ethsign && \
	(cd ethsign && git checkout d7591c9cac762f15c7087c2d066176bb75ba8095) && \
	git clone https://github.com/paritytech/ethabi.git  && \
	(cd ethabi && git checkout 81e393742ad03a6f993f2b06d3603d827e1bae00) && \
	git clone https://github.com/keenerd/jshon.git && \
	(cd jshon && git checkout d919aeaece37962251dbe6c1ee50f0028a5c90e4) && \
	make install -C seth prefix=/build/artifacts && \
	make install -C dapp prefix=/build/artifacts && \
	make -C jshon LDFLAGS="-static" && \
	make install -C jshon TARGET_PATH=/build/artifacts/bin

RUN (export GOPATH=/var/gopath && export GOBIN=/var/gopath/bin; mkdir -p $GOBIN; cd /build/makertools/ethsign/ && /usr/lib/go-1.8/bin/go get && /usr/lib/go-1.8/bin/go build && cp ethsign /build/artifacts/bin/ )

RUN (cd /build/makertools/ethabi/ && cargo build && cp target/debug/ethabi /build/artifacts/bin )

ENV PATH="/build/artifacts/bin:${PATH}" \
	ETH_RPC_URL=http://ethereum-node:8545 \
	ETH_KEYSTORE=/tmp/keystore/ \
	ETH_FROM=0x913dA4198E6bE1D5f5E4a40D0667f70C0B5430Eb

WORKDIR /build/sai
RUN dapp build
