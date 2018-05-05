FROM node@sha256:dbb1e74774617c46a34f67d25decbdc5841af2a2a08a125a37743c734799b909
# Docker Tag: node:8.11.1-stretch

ADD ./vendor /tmp/vendor
ADD ./key.json /tmp/keystore/

WORKDIR /build

# install vendor'd tools and dependencies
RUN dpkg -i /tmp/vendor/*.deb
RUN apt-get update && apt-get -y install golang

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
	git clone https://github.com/keenerd/jshon.git && \
	(cd jshon && git checkout d919aeaece37962251dbe6c1ee50f0028a5c90e4) && \
	make install -C seth prefix=/build/artifacts && \
	make install -C dapp prefix=/build/artifacts && \
	make -C jshon LDFLAGS="-static" && \
	make install -C jshon TARGET_PATH=/build/artifacts/bin && \
	(export GOPATH=/var/gopath ; cd ethsign/ ; go get ; go build ; cp ethsign /build/artifacts/bin/ )

ENV PATH="/build/artifacts/bin:${PATH}" \
	ETH_RPC_URL=http://192.168.6.128:8545 \
	ETH_KEYSTORE=/tmp/keystore/ \
	ETH_FROM=0x913dA4198E6bE1D5f5E4a40D0667f70C0B5430Eb

WORKDIR /build/sai
RUN dapp build
