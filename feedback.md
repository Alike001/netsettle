# iExec Nox Tool Feedback

This feedback comes from building and testing NetSettle with:

- `@iexec-nox/nox-protocol-contracts` `0.2.4`
- `@iexec-nox/nox-hardhat-plugin` `0.2.0`
- `@iexec-nox/handle` `0.1.0-beta.13`
- Hardhat `3.12.0`
- Solidity `0.8.35`

## What worked well

The Hardhat plugin made it possible to test the actual confidential lifecycle locally instead of mocking encryption. We verified successful netting, public proof validation, collateral-cap failure, encrypted overflow failure, and refunds against the Docker-backed Nox stack.

The Solidity SDK's safe arithmetic operations fit financial invariants well. NetSettle can turn overflow and over-collateral inputs into deterministic public failure flags without exposing the underlying bilateral values.

The Handle SDK's typed `encryptInput` and `publicDecrypt` results make the application/owner proof boundary explicit. The built-in Ethereum Sepolia gateway, NoxCompute, and subgraph configuration also reduced frontend configuration.

## Friction we hit

### Compiler version drift

The current protocol-contract imports require `pragma solidity ^0.8.35`. A Hello World path that suggested an older `0.8.x` compiler led Remix to select `0.8.34`, which fails before compilation. The package pragma is authoritative, but the onboarding path should name the exact current minimum.

### Ambiguous wallet ownership

In Hardhat, a wallet client can expose multiple addresses through `getAddresses()`. The Handle SDK selected the first returned address as the encryption owner even when another account signed the transaction. Inputs from participant B then failed onchain with `Owner mismatch`.

We fixed this without weakening the contract: each Handle client now exposes only the address that will sign. A documented invariant or an explicit `owner` option would make multi-account clients safer and easier to debug.

### Privacy-boundary wording

The Handle SDK sends plaintext to the trusted Nox gateway over TLS and receives an encrypted handle and proof. This is materially different from browser-local encryption. A short, prominent architecture diagram in the onboarding docs would help builders describe the trust boundary accurately and avoid claiming that the gateway never sees plaintext.

### Asynchronous proof ergonomics

Public decryption is naturally asynchronous, so a real product needs named pending states, polling, retry, reload recovery, timeouts, and refunds. Examples mostly centered on the successful call sequence. A reference state machine covering delayed and failed proof retrieval would help teams build recoverable products rather than scripted demos.

### Version alignment

The docs, starter, Solidity package, Hardhat plugin, and beta Handle SDK moved at different speeds. Pinning every direct dependency was necessary for reproducible behavior. A tested compatibility table for each release would reduce setup and debugging time.

## Suggested improvements

1. Publish one versioned end-to-end Sepolia starter that pins the compiler, plugin, Solidity SDK, and Handle SDK together.
2. Let `createViemHandleClient` accept an explicit owner address and reject ambiguous multi-address clients.
3. Document the gateway trust boundary next to the first encryption example.
4. Add a recoverable asynchronous state-machine example with retry, reload, timeout, and proof failure.
5. Add financial examples for safe arithmetic, ACL persistence, public decryption, and failure paths—not only happy-path encrypted storage.

## Reproduction notes

The local integration suite is:

```bash
XDG_CACHE_HOME="$PWD/.cache" npm run test:nox
```

The wallet-owner adapter that resolved the mismatch is in `contracts/test/helpers/settlement.ts`. NetSettle intentionally keeps the Nox owner/application proof validation intact.
