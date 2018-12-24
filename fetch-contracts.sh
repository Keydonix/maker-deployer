#!/usr/bin/env bash

CONTRACT_DIR=source/contracts

set -e
mkdir -p $CONTRACT_DIR && cd $CONTRACT_DIR

function cloneCheckoutCommit() {
  cloneDirName=${1##*/}
  if [ -d $cloneDirName ]; then
    (cd $cloneDirName && [ -z "$(git status --porcelain)" ] && git checkout $2) || (echo Unclean $cloneDirName && exit 1)
    return
  fi
  git clone https://github.com/$1 && (cd $cloneDirName && git checkout $2 )
}

cloneCheckoutCommit makerdao/sai 56eed66bb42a485ff0819f4ca227f615b1eb5320
cloneCheckoutCommit dapphub/ds-chief a06b5e426a30e1471b93093857760b85e2fcb93a
cloneCheckoutCommit dapphub/ds-guard f8b7f58c0fb5e88bba376e3dfa7a856617fabc0e
cloneCheckoutCommit dapphub/ds-roles 188b3dd6497d1f8c17b5bb381b37bdf238e3d239
cloneCheckoutCommit dapphub/ds-spell 1af739014d6b9ab3bd782ba09b23d2f10521c55b
cloneCheckoutCommit dapphub/ds-test 8053e2589749238451678b5a75028bc830dc31cb
cloneCheckoutCommit dapphub/ds-thing 4c86a534b2cdaf7c7a8564dfd8572ef466615a00
cloneCheckoutCommit dapphub/ds-token e637e3f3aff929ca4e72966015c16df0b235ea2a
cloneCheckoutCommit dapphub/ds-value faae4cb37922fcdb002793a34c7d410b0a23e737
cloneCheckoutCommit dapphub/ds-auth 52c6a32a858601859dd809c718b59fb064fa21a7
cloneCheckoutCommit dapphub/ds-note 7170a0881717e4aeb91527f6b596d820b62e7260
cloneCheckoutCommit dapphub/ds-math 87bef2f67b043819b7195ce6df3058bd3c321107
cloneCheckoutCommit dapphub/ds-exec f6b61769c700326b7c3e7bfad6e9f2c16a9148e1
cloneCheckoutCommit dapphub/ds-stop 842e35008eddc28a914e56be94afb7de3aec9d1d
cloneCheckoutCommit dapphub/erc20 c4f56358d57e55e6d1c6626798cd325c9cc57d92
cloneCheckoutCommit makerdao/maker-otc cc5f6b9c1cacd9f8cf053a1dbd36f3e0b77d28fa
