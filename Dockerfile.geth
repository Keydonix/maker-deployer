FROM keydonix/geth-clique-node8-solc as builder
# TODO: use digest

COPY . /maker-deployer

WORKDIR /maker-deployer

RUN /maker-deployer/scripts/run-geth-and-deploy.sh

WORKDIR /


FROM keydonix/geth-clique
COPY --from=builder /geth/chain /geth/chain

COPY --from=builder /maker-deployer/output/contracts /contracts

# docker image build . -t keydonix/geth-clique-maker
