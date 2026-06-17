# @deepflow/sdk

Deepflow TypeScript SDK prototype.

This package implements the first local execution slice:

- `ExecutionIntent`, `ExecutionPolicy`, `CreditSource`, `RoutePlan`, `ExecutionResult`.
- Policy validation for assets, markets, destination whitelist, slippage, period budget, session scope, kill switch, frequency and repeated failure limits.
- Mock route planning for `withdraw -> DeepBook trade -> settle -> redeposit / return`.
- Mock PTB output with an explicit all-or-nothing rollback guarantee.

The package intentionally does not connect to Sui, DeepBook, NAVI or Cetus yet. It is a local safety and routing prototype for validating Deepflow's execution model before real adapters are added.

## Run Tests

```sh
npm --workspace @deepflow/sdk test
```
