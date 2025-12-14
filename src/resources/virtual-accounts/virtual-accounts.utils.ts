import type {
  DepositInstructions,
  IBANAccountDetails,
  USAccountDetails,
  InternationalWireAccountDetails,
} from "@/resources/virtual-accounts/virtual-accounts.types";

/**
 * Type guard to check if deposit instructions are for an IBAN account (EUR/SEPA).
 *
 * @param instructions - The deposit instructions to check
 * @returns True if the instructions are for an IBAN account
 *
 * @example
 * ```typescript
 * if (isIBANAccountDetails(instructions)) {
 *   console.log(instructions.iban.iban_number);
 * }
 * ```
 */
export function isIBANAccountDetails(
  instructions: DepositInstructions
): instructions is IBANAccountDetails {
  return (instructions as IBANAccountDetails).iban !== undefined;
}

/**
 * Type guard to check if deposit instructions are for a US account (USD/ACH/Wire).
 *
 * @param instructions - The deposit instructions to check
 * @returns True if the instructions are for a US account
 *
 * @example
 * ```typescript
 * if (isUSAccountDetails(instructions)) {
 *   console.log(instructions.us.routing_number);
 * }
 * ```
 */
export function isUSAccountDetails(
  instructions: DepositInstructions
): instructions is USAccountDetails {
  return (instructions as USAccountDetails).us !== undefined;
}

/**
 * Type guard to check if deposit instructions are for an International Wire account (USD/SWIFT).
 *
 * @param instructions - The deposit instructions to check
 * @returns True if the instructions are for an International Wire account
 *
 * @example
 * ```typescript
 * if (isInternationalWireAccountDetails(instructions)) {
 *   console.log(instructions.international_wire.bic);
 * }
 * ```
 */
export function isInternationalWireAccountDetails(
  instructions: DepositInstructions
): instructions is InternationalWireAccountDetails {
  return (
    (instructions as InternationalWireAccountDetails).international_wire !==
    undefined
  );
}
